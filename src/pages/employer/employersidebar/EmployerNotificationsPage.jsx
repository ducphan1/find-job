// src/pages/employer/employersidebar/EmployerNotificationsPage.jsx
import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import { Table, Tag, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../../styles/EmployerDashboardPage.css";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const EmployerNotificationsPage = () => {
  const [data, setData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hàm xác định nhãn và màu sắc cho loại thông báo
  const getNotificationTypeInfo = (type) => {
    switch (type) {
      case "new_application":
      case "application_submitted":
        return { label: "Ứng viên nộp CV", color: "blue" };
      case "application_rejected":
        return { label: "Từ chối ứng viên", color: "red" };
      case "admin_message":
      case "admin_broadcast":
        return { label: "Từ Admin", color: "purple" };
      case "job_created":
        return { label: "Tạo công việc", color: "green" };
      case "job_updated":
        return { label: "Cập nhật công việc", color: "orange" };
      case "job_approved":
        return { label: "Công việc được duyệt", color: "cyan" };
      case "job_rejected":
        return { label: "Công việc bị từ chối", color: "volcano" };
      case "company_created":
      case "company_updated":
      case "company_approved":
      case "company_rejected":
        return { label: "Công ty", color: "gold" };
      default:
        return { label: "Thông báo", color: "gold" };
    }
  };

  // Lấy danh sách thông báo từ API
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Vui lòng đăng nhập để xem thông báo!");
      navigate("/employer/login");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifications = response.data.notifications.map((notif) => {
        const typeInfo = getNotificationTypeInfo(notif.type);
        return {
          key: notif._id,
          type: typeInfo.label,
          title: notif.message,
          date: new Date(notif.createdAt).toLocaleDateString("vi-VN"),
          label: notif.read ? null : "Mới",
          relatedId: notif.relatedId || notif.application || null,
          typeColor: typeInfo.color,
        };
      });
      setData(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      message.error(
        error.response?.data?.message || "Không thể tải danh sách thông báo!"
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/employer/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo Socket.IO và lấy thông báo
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Vui lòng đăng nhập để xem thông báo!");
      navigate("/employer/login");
      return;
    }

    // Thiết lập Socket.IO
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      reconnection: true, // Tự động kết nối lại nếu mất kết nối
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("notification", (notification) => {
      const typeInfo = getNotificationTypeInfo(notification.type);
      setData((prevData) => [
        {
          key: notification._id,
          type: typeInfo.label,
          title: notification.message,
          date: new Date(notification.createdAt).toLocaleDateString("vi-VN"),
          label: "Mới",
          relatedId: notification.relatedId || notification.job || null,
          typeColor: typeInfo.color,
        },
        ...prevData,
      ]);
      message.info(`Thông báo mới: ${notification.message}`);
    });

    newSocket.on("notificationUpdated", (updatedNotification) => {
      setData((prevData) =>
        prevData.map((item) =>
          item.key === updatedNotification._id ? { ...item, label: null } : item
        )
      );
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Lấy thông báo ban đầu
    fetchNotifications();

    // Dọn dẹp khi component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  // Đánh dấu thông báo là đã đọc
  const markNotificationAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData((prevData) =>
        prevData.map((item) =>
          item.key === notificationId ? { ...item, label: null } : item
        )
      );
      if (socket) {
        socket.emit("notificationUpdated", { _id: notificationId, read: true });
      }
      message.success("Đã đánh dấu thông báo là đã đọc!");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      message.error(
        error.response?.data?.message || "Không thể đánh dấu thông báo!"
      );
    }
  };

  // Định nghĩa cột
  const columns = [
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type, record) => <Tag color={record.typeColor}>{type}</Tag>,
      width: 150,
    },
    {
      title: "Nội dung",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <span>
          {text} {record.label && <Tag color="green">{record.label}</Tag>}
          {!record.label && (
            <Tag color="gray" style={{ cursor: "default" }}>
              Đã đọc
            </Tag>
          )}
          <a
            onClick={() => markNotificationAsRead(record.key)}
            style={{ marginLeft: 8, color: "#1890ff" }}
          >
            Đánh dấu đã đọc
          </a>
        </span>
      ),
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: 130,
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Thông báo hệ thống</h2>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        rowKey="key"
        loading={loading}
      />
    </div>
  );
};

export default EmployerNotificationsPage;
