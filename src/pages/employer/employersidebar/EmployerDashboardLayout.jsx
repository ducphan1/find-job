import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Avatar, Menu, Modal, message } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  LockOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { io } from "socket.io-client"; // Thêm Socket.IO client
import "../../../styles/EmployerDashboardPage.css";

const EmployerDashboardLayout = () => {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [notificationsCount, setNotificationsCount] = useState(0); // Đếm thông báo mới
  const [socket, setSocket] = useState(null); // State cho Socket.IO

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

  // Thiết lập Socket.IO và lấy thông tin công ty
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/employer/login");
      return;
    }

    // Khởi tạo Socket.IO
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
    });
    setSocket(newSocket);

    // Lắng nghe thông báo từ server
    newSocket.on("notification", (data) => {
      message.info(`Thông báo: ${data.message}`);
      if (
        data.type === "application_added" ||
        data.type === "company_updated"
      ) {
        setNotificationsCount((prev) => prev + 1); // Tăng số thông báo mới
      }
    });

    // Lấy thông tin công ty
    const fetchMyCompany = async () => {
      try {
        const response = await axios.get(`${API_URL}/companies/my-company`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Dữ liệu công ty từ backend:", response.data);
        setCompanyId(response.data._id || response.data.id);
        setCompanyData(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin công ty:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("loggedInUser");
          navigate("/employer/login");
        } else {
          navigate("/employer/dashboard");
        }
      }
    };

    fetchMyCompany();

    // Dọn dẹp khi component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [navigate, API_URL]);

  // Hàm xử lý đăng xuất
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
      onCancel: () => {
        console.log("Hủy đăng xuất");
      },
    });
  };

  // Danh sách menu
  const menuItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: "Bảng tin",
      onClick: () => navigate("/employer/dashboard"),
    },
    {
      key: "jobs",
      icon: <FileTextOutlined />,
      label: "Đăng tin tuyển dụng",
      onClick: () => navigate("/employer/jobs"),
    },
    {
      key: "job-management",
      icon: <FileTextOutlined />,
      label: "Quản lý tin tuyển dụng",
      onClick: () => navigate("/employer/job-management"),
    },
    {
      key: "cv",
      icon: <UserOutlined />,
      label: "Quản lý CV",
      onClick: () => navigate("/employer/cv"),
    },
    {
      key: "company-edit",
      icon: <UserOutlined />,
      label: "Chỉnh sửa thông tin công ty",
      onClick: () => {
        if (companyId) {
          navigate(`/employer/edit-company/${companyId}`);
        } else {
          navigate("/employer/dashboard");
        }
      },
    },
    {
      key: "security",
      icon: <LockOutlined />,
      label: "Cài đặt tài khoản",
      onClick: () => navigate("/employer/security"),
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: `Thông báo hệ thống (${notificationsCount})`, // Hiển thị số thông báo
      onClick: () => {
        setNotificationsCount(0); // Reset số thông báo khi xem
        navigate("/employer/notifications");
      },
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const avatarUrl =
    companyData?.logo ||
    companyData?.avatar ||
    "https://i.pravatar.cc/150?img=12";

  return (
    <div className="employer-layout">
      {/* Thanh topbar */}
      <div className="employer-topbar">
        <div className="topbar-left">
          <img
            src="https://i.imgur.com/QfQZQZb.png"
            alt="logo"
            className="topbar-logo"
          />
          <div className="topbar-support">
            <h4>Hỗ trợ tuyển dụng</h4>
            <p>0909.123.456 | support@topcv.vn</p>
          </div>
        </div>
        <div className="topbar-right">
          <div
            className="topbar-item"
            onClick={() => navigate("/employer/jobs")}
          >
            <PlusOutlined />
            Đăng tin
          </div>
          <div className="topbar-item" onClick={() => navigate("/employer/cv")}>
            <FileSearchOutlined />
            Tìm CV
          </div>
          <div className="topbar-item" onClick={() => navigate("/employer/cv")}>
            <EyeOutlined />
            Xem hồ sơ
          </div>
        </div>
      </div>

      {/* Layout chính */}
      <div className="employer-main-layout">
        {/* Sidebar */}
        <div className="employer-sidebar">
          <div className="sidebar-profile">
            <Avatar
              size={150}
              src={avatarUrl}
              style={{ border: "2px solid #fff" }}
            />
            <div className="profile-name">Đức Phan</div>
            <div className="profile-level">Employer</div>
            <div className="profile-verify">Tài khoản xác thực: Cấp 1/3</div>
            <a className="verify-link">Xác thực tài khoản điện tử</a>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["dashboard"]}
            items={menuItems}
            style={{ backgroundColor: "transparent" }}
          />
        </div>

        {/* Nội dung chính */}
        <div className="employer-content">
          <Outlet context={{ socket }} /> {/* Truyền socket qua Outlet */}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardLayout;
