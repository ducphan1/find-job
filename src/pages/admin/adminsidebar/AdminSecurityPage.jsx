import React, { useState, useEffect } from "react";
import { Button, Input, message } from "antd";
import axios from "axios";
import { io } from "socket.io-client"; // Import Socket.IO client
import "../../../styles/AdminDashboardPage.css";

const AdminSecurityPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [socket, setSocket] = useState(null); // State to manage Socket.IO connection

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"; // Adjust this URL if different

  // Initialize Socket.IO connection when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` }, // Pass the token for authentication
    });

    setSocket(newSocket);

    // Listen for notifications
    newSocket.on("notification", (data) => {
      if (data.type === "admin_message" || data.type === "password_changed") {
        message.info(`Thông báo: ${data.message}`);
        setSuccess(data.message); // Update UI with the notification
        setError("");
      }
    });

    newSocket.on("notificationUpdated", (data) => {
      if (data.read) {
        message.info("Thông báo đã được đánh dấu là đã đọc.");
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setError("");

      // Optionally emit a socket event to notify other clients (if needed)
      if (socket) {
        socket.emit("passwordChanged", {
          message: "Mật khẩu của bạn đã được thay đổi thành công.",
          type: "password_changed",
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi khi đổi mật khẩu");
      setSuccess("");
    }
  };

  const handleEnableTwoFactor = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/enable-two-factor`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Bật xác thực hai yếu tố thành công!");
      setError("");
      message.success("Bật xác thực hai yếu tố thành công!");

      // Optionally emit a socket event to notify other clients (if needed)
      if (socket) {
        socket.emit("twoFactorEnabled", {
          message: "Xác thực hai yếu tố đã được bật.",
          type: "two_factor_enabled",
        });
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Lỗi khi bật xác thực hai yếu tố"
      );
      setSuccess("");
      message.error("Lỗi khi bật xác thực hai yếu tố!");
    }
  };

  return (
    <div className="admin-security-page">
      <h2>Bảo mật</h2>
      <div className="security-section">
        <h3>Đổi mật khẩu</h3>
        <Input.Password
          placeholder="Mật khẩu cũ"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input.Password
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Button type="primary" onClick={handleChangePassword}>
          Cập nhật
        </Button>
      </div>
      <div className="security-section">
        <h3>Xác thực hai yếu tố</h3>
        <Button type="primary" onClick={handleEnableTwoFactor}>
          Bật xác thực hai yếu tố
        </Button>
      </div>
      {success && <p style={{ color: "green", marginTop: 10 }}>{success}</p>}
      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
};

export default AdminSecurityPage;
