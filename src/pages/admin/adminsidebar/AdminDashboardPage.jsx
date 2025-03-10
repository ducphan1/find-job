import React, { useState, useEffect } from "react";
import {
  TeamOutlined,
  UserOutlined,
  FileTextOutlined,
  BellOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../../../styles/AdminDashboardPage.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    totalAdmins: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCVs: 0,
    totalSlides: 0,
  });
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để truy cập dashboard");
          navigate("/admin/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [
          statsResponse,
          usersResponse,
          notificationsResponse,
          jobsResponse,
        ] = await Promise.all([
          axios.get(`${API_URL}/admin/stats`, config).catch((err) => {
            throw new Error(
              `Lỗi khi lấy thống kê: ${err.response?.data?.message || err.message}`
            );
          }),
          axios.get(`${API_URL}/admin/users`, config).catch((err) => {
            throw new Error(
              `Lỗi khi lấy danh sách người dùng: ${err.response?.data?.message || err.message}`
            );
          }),
          axios.get(`${API_URL}/notifications`, config).catch((err) => {
            throw new Error(
              `Lỗi khi lấy thông báo: ${err.response?.data?.message || err.message}`
            );
          }),
          axios.get(`${API_URL}/admin/jobs`, config).catch((err) => {
            throw new Error(
              `Lỗi khi lấy danh sách công việc: ${err.response?.data?.message || err.message}`
            );
          }),
        ]);

        // Kiểm tra và xử lý dữ liệu trả về
        if (!statsResponse.data || typeof statsResponse.data !== "object") {
          throw new Error("Dữ liệu thống kê không hợp lệ");
        }
        if (!Array.isArray(usersResponse.data)) {
          throw new Error("Danh sách người dùng không phải mảng");
        }
        if (
          !notificationsResponse.data ||
          !Array.isArray(notificationsResponse.data.notifications)
        ) {
          console.warn(
            "Dữ liệu thông báo không hợp lệ, gán mặc định là mảng rỗng"
          );
          notificationsResponse.data = { notifications: [] };
        }
        if (!Array.isArray(jobsResponse.data)) {
          throw new Error("Danh sách công việc không phải mảng");
        }

        setStats({
          ...statsResponse.data,
          totalUsers: usersResponse.data.length,
        });
        setNotificationsCount(
          notificationsResponse.data.notifications.filter((n) => !n.read).length
        );
        setPendingJobs(
          jobsResponse.data.filter((job) => job.status === "pending")
        );

        const activities = notificationsResponse.data.notifications.map(
          (n) => ({
            _id: n._id,
            message: n.message || "Không có nội dung",
            time: new Date(n.createdAt || Date.now()).toLocaleString(),
            type: n.type === "job_created" ? "job" : "user",
            read: n.read || false,
          })
        );
        setRecentActivities(activities);
      } catch (error) {
        console.error("fetchInitialData error:", error);
        setError(error.message || "Lỗi không xác định khi lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io("http://localhost:5000", {
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Socket.IO connected in AdminDashboardPage");
    });

    socket.on("notification", (notification) => {
      console.log("Received Socket.IO notification:", notification);
      if (!notification || !notification._id) return;

      setNotificationsCount((prev) => prev + (notification.read ? 0 : 1));

      const isNewJob = notification.type === "job_created";
      const isNewUser =
        notification.type === "user_registered" ||
        notification.type === "employer_registered";

      if (isNewJob) {
        toast.info(`Thông báo: ${notification.message}`, {
          onClick: () => navigate("/admin/jobs"),
          autoClose: 5000,
        });
        setRecentActivities((prev) => [
          {
            _id: notification._id,
            message: notification.message || "Công việc mới",
            time: new Date(
              notification.createdAt || Date.now()
            ).toLocaleString(),
            type: "job",
            read: notification.read || false,
          },
          ...prev.slice(0, 4),
        ]);
        if (notification.job) {
          setPendingJobs((prev) => [
            {
              _id: notification.relatedId || Date.now(),
              title: notification.job.title || "Chưa có tiêu đề",
              company: notification.job.company || { name: "Chưa xác định" },
              status: "pending",
            },
            ...prev,
          ]);
        }
        setStats((prev) => ({ ...prev, totalJobs: prev.totalJobs + 1 }));
      } else if (isNewUser) {
        toast.info(`Thông báo: ${notification.message}`, {
          onClick: () =>
            navigate(
              notification.type === "user_registered"
                ? "/admin/users"
                : "/admin/employers"
            ),
          autoClose: 5000,
        });
        setRecentActivities((prev) => [
          {
            _id: notification._id,
            message: notification.message || "Người dùng mới",
            time: new Date(
              notification.createdAt || Date.now()
            ).toLocaleString(),
            type: "user",
            read: notification.read || false,
          },
          ...prev.slice(0, 4),
        ]);
        setStats((prev) => ({
          ...prev,
          [notification.type === "user_registered"
            ? "totalUsers"
            : "totalEmployers"]:
            prev[
              notification.type === "user_registered"
                ? "totalUsers"
                : "totalEmployers"
            ] + 1,
        }));
      }
    });

    socket.on("notificationUpdated", (updatedNotification) => {
      if (!updatedNotification || !updatedNotification._id) return;
      setRecentActivities((prev) =>
        prev.map((activity) =>
          activity._id === updatedNotification._id
            ? { ...activity, read: updatedNotification.read }
            : activity
        )
      );
      setNotificationsCount((prev) =>
        updatedNotification.read ? prev - 1 : prev
      );
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
      toast.error("Lỗi kết nối Socket.IO");
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [navigate, API_URL]);

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecentActivities((prev) =>
        prev.map((activity) =>
          activity._id === notificationId
            ? { ...activity, read: true }
            : activity
        )
      );
      setNotificationsCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error(
        `Lỗi khi đánh dấu thông báo: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const chartData = {
    labels: [
      "Người dùng",
      "Nhà tuyển dụng",
      "Admin",
      "Công ty",
      "Tin tuyển dụng",
      "Ứng tuyển",
      "CV",
      "Slide",
    ],
    datasets: [
      {
        label: "Số lượng",
        data: [
          stats.totalUsers,
          stats.totalEmployers,
          stats.totalAdmins,
          stats.totalCompanies,
          stats.totalJobs,
          stats.totalApplications,
          stats.totalCVs,
          stats.totalSlides,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(199, 199, 199, 0.6)",
          "rgba(83, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(199, 199, 199, 1)",
          "rgba(83, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Thống kê hệ thống", font: { size: 20 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Số lượng", font: { size: 14 } },
      },
      x: { title: { display: true, text: "Danh mục", font: { size: 14 } } },
    },
  };

  const handleStatClick = (label) => {
    switch (label) {
      case "Tổng người dùng":
        navigate("/admin/users");
        break;
      case "Nhà tuyển dụng":
        navigate("/admin/employers");
        break;
      case "Tin tuyển dụng":
        navigate("/admin/jobs");
        break;
      case "Thông báo mới":
        navigate("/admin/notifications");
        break;
      default:
        break;
    }
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="admin-dashboard-page">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
      <div className="admin-stats-row">
        <div
          className="admin-stat-box"
          onClick={() => handleStatClick("Tổng người dùng")}
          style={{ cursor: "pointer" }}
        >
          <TeamOutlined className="stat-icon" />
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Tổng người dùng</div>
        </div>
        <div
          className="admin-stat-box"
          onClick={() => handleStatClick("Nhà tuyển dụng")}
          style={{ cursor: "pointer" }}
        >
          <UserOutlined className="stat-icon" />
          <div className="stat-number">{stats.totalEmployers}</div>
          <div className="stat-label">Nhà tuyển dụng</div>
        </div>
        <div
          className="admin-stat-box"
          onClick={() => handleStatClick("Tin tuyển dụng")}
          style={{ cursor: "pointer" }}
        >
          <FileTextOutlined className="stat-icon" />
          <div className="stat-number">{stats.totalJobs}</div>
          <div className="stat-label">Tin tuyển dụng</div>
        </div>
        <div
          className="admin-stat-box"
          onClick={() => handleStatClick("Thông báo mới")}
          style={{ cursor: "pointer" }}
        >
          <BellOutlined className="stat-icon" />
          <div className="stat-number">{notificationsCount}</div>
          <div className="stat-label">Thông báo mới</div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="left-col">
          <div className="system-stats-square">
            <h3 className="effect-title">Thống kê hệ thống</h3>
            <div
              style={{
                height: "450px",
                background: "#f9f9f9",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="action-button">
              <button>Xem báo cáo chi tiết</button>
            </div>
          </div>
        </div>
        <div className="right-col">
          <motion.div
            className="activity-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            style={{
              background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
          >
            <h3 style={{ color: "#1565c0" }}>Hoạt động gần đây</h3>
            {recentActivities.length > 0 ? (
              <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                {recentActivities.slice(0, 3).map((activity, index) => (
                  <motion.li
                    key={activity._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.3 }}
                    style={{
                      marginBottom: "10px",
                      color: activity.type === "job" ? "#d32f2f" : "#388e3c",
                      fontWeight: activity.read ? "normal" : "bold",
                      textDecoration: activity.read ? "line-through" : "none",
                    }}
                    onClick={() =>
                      !activity.read && markNotificationAsRead(activity._id)
                    }
                  >
                    {activity.message} -{" "}
                    <span style={{ color: "#666" }}>{activity.time}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p>Chưa có hoạt động nào được ghi nhận.</p>
            )}
          </motion.div>
          <motion.div
            className="pending-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            style={{
              background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
              borderRadius: "8px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
            onClick={() => navigate("/admin/jobs")}
          >
            <h3 style={{ color: "#ef6c00" }}>Tin cần duyệt</h3>
            {pendingJobs.length > 0 ? (
              <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
                {pendingJobs.slice(0, 3).map((job, index) => (
                  <motion.li
                    key={job._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.3 }}
                    style={{
                      marginBottom: "10px",
                      color: "#ef6c00",
                      fontWeight: "500",
                    }}
                  >
                    {job.title} - {job.company?.name || "Chưa có công ty"}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p>Không có tin tuyển dụng nào đang chờ duyệt.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
