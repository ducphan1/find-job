import React, { useState, useEffect } from "react";
import { List, Button, Input, Select, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../../../styles/AdminDashboardPage.css";

const { Option } = Select;

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState("");
  const [recipientRole, setRecipientRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để truy cập");
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(`${API_URL}/admin/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!Array.isArray(response.data)) {
          throw new Error("Danh sách thông báo không hợp lệ");
        }
        setNotifications(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Lỗi khi lấy thông báo");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io("http://localhost:5000", {
      query: { token, userId: localStorage.getItem("userId") }, // Giả sử userId lưu trong localStorage
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket.IO connected in AdminNotificationsPage");
    });

    socketInstance.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
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

  const handleAddNotification = async () => {
    if (!newNotification.trim()) {
      message.error("Vui lòng nhập nội dung thông báo!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/admin/notifications`,
        { message: newNotification, recipientRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications([...notifications, response.data]);
      setNewNotification("");
      setRecipientRole("all");
      message.success("Thêm thông báo thành công!");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Lỗi khi thêm thông báo";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.filter((n) => n._id !== id));
      message.success("Xóa thông báo thành công!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi xóa thông báo";
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-notifications-page">
      <h2>Thông báo</h2>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <Input
          value={newNotification}
          onChange={(e) => setNewNotification(e.target.value)}
          placeholder="Nhập thông báo mới"
          style={{ flex: 1 }}
        />
        <Select
          value={recipientRole}
          onChange={(value) => setRecipientRole(value)}
          style={{ width: 120 }}
        >
          <Option value="all">Tất cả</Option>
          <Option value="user">Người dùng</Option>
          <Option value="employer">Nhà tuyển dụng</Option>
          <Option value="admin">Admin</Option>
        </Select>
        <Button type="primary" onClick={handleAddNotification}>
          Thêm thông báo
        </Button>
      </div>
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="link"
                danger
                onClick={() => handleDeleteNotification(item._id)}
              >
                Xóa
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<BellOutlined />}
              title={item.message}
              description={
                <>
                  <span>{new Date(item.createdAt).toLocaleString()}</span> |{" "}
                  <span>
                    Đối tượng: {item.recipientRole || "Không xác định"}
                  </span>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default AdminNotificationsPage;
