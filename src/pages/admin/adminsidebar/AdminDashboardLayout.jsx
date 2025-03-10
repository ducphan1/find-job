import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Avatar, Menu, Modal, Badge, message } from "antd"; // Thêm Badge
import {
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  LockOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  PictureOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { io } from "socket.io-client"; // Thêm socket.io-client
import "../../../styles/AdminDashboardPage.css";

const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null); // State cho Socket.IO
  const [notificationCount, setNotificationCount] = useState(0); // Đếm số thông báo chưa đọc

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Khởi tạo Socket.IO và fetch profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Khởi tạo Socket.IO
    const socket = io("http://localhost:5000", {
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Socket.IO connected in AdminDashboardLayout");
    });

    socket.on("notification", (notification) => {
      console.log("Received Socket.IO notification:", notification);
      setNotificationCount((prev) => prev + 1); // Tăng số thông báo chưa đọc
      if (notification.type === "job_created") {
        message.success(
          `${notification.message} Xem tại Quản lý tin tuyển dụng!`
        );
      } else if (notification.type === "user_registered") {
        message.info(`${notification.message} Xem tại Quản lý người dùng!`);
      } else if (notification.type === "employer_registered") {
        message.info(`${notification.message} Xem tại Quản lý nhà tuyển dụng!`);
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

    // Fetch thông tin admin
    const fetchAdminProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdminData(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Lỗi khi lấy thông tin admin"
        );
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();

    // Cleanup khi component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [navigate, API_URL]);

  const handleLogout = () => {
    Modal.confirm({
      title: "Xác nhận đăng xuất",
      content: "Bạn có chắc chắn muốn đăng xuất không?",
      okText: "Có",
      cancelText: "Không",
      onOk: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("loggedInUser");
        navigate("/");
      },
    });
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: "Bảng tin",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: "Quản lý người dùng",
      onClick: () => navigate("/admin/users"),
    },
    {
      key: "employers",
      icon: <UserOutlined />,
      label: "Quản lý nhà tuyển dụng",
      onClick: () => navigate("/admin/employers"),
    },
    {
      key: "jobs",
      icon: <FileTextOutlined />,
      label: "Quản lý tin tuyển dụng",
      onClick: () => navigate("/admin/jobs"),
    },
    {
      key: "slides",
      icon: <PictureOutlined />,
      label: "Chỉnh sửa slide",
      onClick: () => navigate("/admin/slides"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt hệ thống",
      onClick: () => navigate("/admin/settings"),
    },
    {
      key: "security",
      icon: <LockOutlined />,
      label: "Bảo mật",
      onClick: () => navigate("/admin/security"),
    },
    {
      key: "notifications",
      icon: (
        <Badge count={notificationCount} offset={[10, 0]}>
          <BellOutlined />
        </Badge>
      ),
      label: "Thông báo",
      onClick: () => {
        setNotificationCount(0); // Reset số thông báo khi xem
        navigate("/admin/notifications");
      },
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const avatarUrl = adminData?.avatar || "https://i.pravatar.cc/150?img=10";

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-layout">
      <div className="admin-topbar">
        <div className="topbar-left">
          <img
            src="https://i.imgur.com/QfQZQZb.png"
            alt="logo"
            className="topbar-logo"
          />
          <div className="topbar-support">
            <h4>Hỗ trợ quản trị</h4>
            <p>0909.123.456 | admin@topcv.vn</p>
          </div>
        </div>
        <div className="topbar-right">
          <div
            className="topbar-item"
            onClick={() => {
              setNotificationCount(0); // Reset số thông báo
              navigate("/admin/notifications");
            }}
          >
            <Badge count={notificationCount} offset={[10, 0]}>
              <BellOutlined />
            </Badge>{" "}
            Thông báo
          </div>
        </div>
      </div>
      <div className="admin-main-layout">
        <div className="admin-sidebar">
          <div className="sidebar-profile">
            <Avatar
              size={150}
              src={avatarUrl}
              style={{ border: "2px solid #fff" }}
            />
            <div className="profile-name">{adminData?.name || "Admin"}</div>
            <div className="profile-level">Administrator</div>
            <div className="profile-verify">Quyền hạn: Toàn quyền</div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["dashboard"]}
            items={menuItems}
            style={{ backgroundColor: "transparent" }}
          />
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
