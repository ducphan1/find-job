import React, { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../../../styles/AdminDashboardPage.css";

const AdminJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để truy cập");
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(`${API_URL}/admin/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!Array.isArray(response.data)) {
          throw new Error("Danh sách tin tuyển dụng không hợp lệ");
        }
        setJobs(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Lỗi khi lấy danh sách tin tuyển dụng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io("http://localhost:5000", {
      query: { token, userId: localStorage.getItem("userId") }, // Giả sử userId lưu trong localStorage
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket.IO connected in AdminJobsPage");
    });

    socketInstance.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [API_URL, navigate]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/admin/jobs/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedJob = response.data.job;
      setJobs(
        jobs.map((job) =>
          job._id === id ? { ...job, status: "approved", visible: true } : job
        )
      );
      message.success("Tin tuyển dụng đã được duyệt thành công!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi duyệt tin";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/admin/jobs/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedJob = response.data.job;
      setJobs(
        jobs.map((job) =>
          job._id === id ? { ...job, status: "rejected", visible: false } : job
        )
      );
      message.success("Tin tuyển dụng đã bị từ chối!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi từ chối tin";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    {
      title: "Công ty",
      key: "company",
      render: (_, record) => record.company?.name || "Chưa có công ty",
    },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record._id)}
            disabled={record.status === "approved"}
            style={{ marginRight: 8 }}
          >
            Xác Thực
          </Button>
          <Button
            icon={<CloseOutlined />}
            onClick={() => handleReject(record._id)}
            disabled={record.status === "rejected"}
            danger
          >
            Chưa Xác Thực
          </Button>
        </>
      ),
    },
  ];

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-jobs-page">
      <h2>Quản lý tin tuyển dụng</h2>
      <div>
        <h3>Thông báo gần đây</h3>
        <ul>
          {notifications.map((notif) => (
            <li key={notif._id}>{notif.message}</li>
          ))}
        </ul>
      </div>
      <Table
        columns={columns}
        dataSource={jobs}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AdminJobsPage;
