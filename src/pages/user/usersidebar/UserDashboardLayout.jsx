import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import "../../../styles/UserDashboardPage.css";
import { Avatar, Progress, Button, Menu, message, Modal } from "antd";
import {
  HomeOutlined,
  EditOutlined,
  SolutionOutlined,
  FileDoneOutlined,
  SaveOutlined,
  FileSearchOutlined,
  LockOutlined,
  LogoutOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ViewProfileModal from "../usersidebar/ViewProfilePage";
import axios from "axios";
import socket from "../../../socket.js"; // Sử dụng instance chung

const UserDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    savedJobs: 0,
    appliedJobs: 0,
    recruitersView: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.warning("Bạn chưa đăng nhập!");
        navigate("/user/login");
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const dashboardRes = await axios.get(
        "http://localhost:5000/api/auth/user/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("API dashboard response:", dashboardRes.data);

      if (dashboardRes.data.user) {
        setUserData(dashboardRes.data.user);
      }
      if (dashboardRes.data.stats) {
        setStats({
          savedJobs: dashboardRes.data.stats.savedJobs || 0,
          appliedJobs: dashboardRes.data.stats.appliedJobs || 0,
          recruitersView: dashboardRes.data.stats.recruitersView || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.name === "AbortError") {
        message.error(
          "Yêu cầu tải dữ liệu đã hết thời gian. Vui lòng thử lại!"
        );
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");
        localStorage.removeItem("token");
        navigate("/user/login");
      } else {
        message.error(
          "Không thể tải thông tin dashboard: " +
            (error.message || "Lỗi không xác định")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener("jobSaved", fetchDashboardData);
    window.addEventListener("jobRemoved", fetchDashboardData);

    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Bạn chưa đăng nhập!");
      navigate("/user/login");
      return;
    }

    const userId = JSON.parse(atob(token.split(".")[1])).id;
    socket.emit("register", userId);

    socket.on("notification", (notification) => {
      console.log(
        "Received notification in UserDashboardLayout:",
        notification
      );
      if (notification.type === "cv_viewed") {
        fetchDashboardData();
      }
      message.info(notification.message);
    });

    return () => {
      window.removeEventListener("jobSaved", fetchDashboardData);
      window.removeEventListener("jobRemoved", fetchDashboardData);
      socket.off("notification");
    };
  }, [navigate]);

  const completionPercent = userData?.completionPercent || 0;

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/user/dashboard") return ["dashboard"];
    if (path === "/user/update") return ["update"];
    if (path === "/newjob") return ["jobs"];
    if (path === "/user/applied") return ["applied"];
    if (path === "/user/saved") return ["saved"];
    if (path === "/user/security") return ["security"];
    return ["dashboard"];
  };

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser"); // Thêm dòng này
    message.success("Đăng xuất thành công!");
    navigate("/");
    setLogoutModalVisible(false);
    // (Tùy chọn) Dispatch sự kiện để thông báo cho Topbar
    window.dispatchEvent(new Event("storage"));
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: <Link to="/user/dashboard">Quản lý chung</Link>,
    },
    {
      key: "update",
      icon: <EditOutlined />,
      label: <Link to="/user/update">Cập nhật hồ sơ</Link>,
    },
    {
      key: "jobs",
      icon: <SolutionOutlined />,
      label: <Link to="/job-listings">Việc làm phù hợp</Link>,
    },
    {
      key: "applied",
      icon: <FileDoneOutlined />,
      label: <Link to="/user/applied">Việc làm đã nộp</Link>,
    },
    {
      key: "saved",
      icon: <SaveOutlined />,
      label: <Link to="/user/saved">Việc làm đã lưu</Link>,
    },
    {
      key: "view",
      icon: <FileSearchOutlined />,
      label: "Xem hồ sơ",
      onClick: () => setModalVisible(true),
    },
    {
      key: "security",
      icon: <LockOutlined />,
      label: <Link to="/user/security">Tài khoản và bảo mật</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      <div className="top-info-bar">
        <div className="top-info-left">
          <img
            src="https://i.imgur.com/QfQZQZb.png"
            alt="logo"
            className="top-info-logo"
          />
          <div className="top-info-text">
            <h4>Hỗ trợ tư vấn dành cho ứng viên</h4>
            <p>0977.520.585 | mentorX@gmail.com</p>
          </div>
        </div>
        <div className="top-info-right">
          <div className="top-nav-item" onClick={() => navigate("/")}>
            <HomeOutlined /> <span>Trang chủ</span>
          </div>
          <div
            className="top-nav-item"
            onClick={() => navigate("/user/update")}
          >
            <EditOutlined /> <span>Tạo CV</span>
          </div>
          <div className="top-nav-item" onClick={() => navigate("/newjob")}>
            <SolutionOutlined /> <span>Viết Review</span>
          </div>
          <div className="top-nav-item" onClick={() => setModalVisible(true)}>
            <FileDoneOutlined /> <span>Xem hồ sơ</span>
          </div>
        </div>
      </div>

      <div className="stat-row" style={{ marginBottom: 20 }}>
        <div className="stat-box">
          <SaveOutlined className="stat-icon" />
          <div className="stat-number">{stats.savedJobs || 0}</div>
          <div className="stat-label">Việc làm đã lưu</div>
        </div>
        <div className="stat-box">
          <FileDoneOutlined className="stat-icon" />
          <div className="stat-number">{stats.appliedJobs || 0}</div>
          <div className="stat-label">Việc làm đã nộp</div>
        </div>
        <div className="stat-box">
          <EyeOutlined className="stat-icon" />
          <div className="stat-number">{stats.recruitersView || 0}</div>
          <div className="stat-label">Nhà tuyển dụng đã xem</div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="sidebar-left">
          <div className="sidebar-avatar">
            <Avatar
              size={80}
              src={
                userData?.avatar ||
                "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
              }
              onError={(e) => {
                e.target.src =
                  "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";
                return true;
              }}
              style={{ border: "2px solid #fff" }}
            />
            <div className="name">{userData?.name || "Người dùng"}</div>
          </div>
          <div className="sidebar-progress">
            Hoàn thiện hồ sơ: {completionPercent}%
            <Progress
              percent={completionPercent}
              showInfo={false}
              strokeColor="#52c41a"
              style={{ marginTop: 5 }}
            />
          </div>
          <div className="sidebar-buttons">
            <Button type="primary" block style={{ marginBottom: 10 }}>
              Làm mới hồ sơ
            </Button>
            <Button
              block
              style={{
                backgroundColor: "#faad14",
                color: "#fff",
                border: "none",
              }}
            >
              Xuất pdf
            </Button>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKey()}
            style={{ backgroundColor: "transparent" }}
            items={menuItems}
            onClick={({ key }) => {
              if (key === "logout" || key === "view") return;
            }}
          />
        </div>

        <div className="dashboard-main">
          <Outlet />
        </div>
      </div>

      <ViewProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <Modal
        title="Xác nhận đăng xuất"
        open={logoutModalVisible}
        onOk={confirmLogout}
        onCancel={cancelLogout}
        okText="Có"
        cancelText="Không"
      >
        <p>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?</p>
      </Modal>
    </div>
  );
};

export default UserDashboardLayout;
