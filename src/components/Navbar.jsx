import React, { useState, useEffect } from "react"; // Thêm useState, useEffect
import { Menu, message } from "antd"; // Thêm message từ antd
import { io } from "socket.io-client"; // Thêm socket.io-client
import "../styles/Navbar.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [socket, setSocket] = useState(null); // State cho Socket.IO

  // Khởi tạo Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, skipping Socket.IO connection");
      return;
    }

    const socket = io("http://localhost:5000", {
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Socket.IO connected in Navbar");
    });

    socket.on("notification", (notification) => {
      console.log("Received Socket.IO notification in Navbar:", notification);
      if (notification.type === "job_created") {
        message.success(`${notification.message} Xem tại "Việc Mới Nhất"!`);
      } else if (
        notification.type === "application_accepted" ||
        notification.type === "application_rejected"
      ) {
        message.info(notification.message);
      } else {
        message.info(notification.message);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    // Cleanup khi component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <div className="navbar-container">
      <div className="logo">
        <a href="/">
          <img src={logo} alt="Logo" />
        </a>
      </div>

      <Menu
        mode="horizontal"
        className="navbar"
        style={{ borderBottom: "none", marginLeft: "-225px" }}
      >
        <Menu.Item key="createcv">
          <a href="/createcv">TẠO HỒ SƠ</a>
        </Menu.Item>
        <Menu.Item key="featuredcompany">
          <a href="/featured">CÔNG TY NỔI BẬT</a>
        </Menu.Item>
        <Menu.Item key="newjobs">
          <a href="/newjob">VIỆC MỚI NHẤT</a>
        </Menu.Item>
        <Menu.Item key="findcandidate">
          <a href="/candidate">TÌM ỨNG VIÊN</a>
        </Menu.Item>
        <Menu.Item key="vipprice">
          <a href="/vip-price">BẢNG GIÁ VIP</a>
        </Menu.Item>
        <Menu.Item key="contact">
          <a href="/contact">LIÊN HỆ</a>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Navbar;
