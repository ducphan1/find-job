import React, { useState, useEffect } from "react";
import { Table, Button } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../../../styles/AdminDashboardPage.css";

const AdminEmployersPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để truy cập");
          navigate("/admin/login");
          return;
        }

        const response = await axios.get(`${API_URL}/admin/companies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!Array.isArray(response.data)) {
          throw new Error("Danh sách công ty không hợp lệ");
        }
        setCompanies(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Lỗi khi lấy danh sách nhà tuyển dụng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();

    // Khởi tạo Socket.IO
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io("http://localhost:5000", {
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Socket.IO connected in AdminEmployersPage");
    });

    socketInstance.on("notification", (notification) => {
      console.log("Received notification:", notification);
      // Có thể cập nhật UI nếu cần (ví dụ: thêm thông báo vào danh sách)
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
        `${API_URL}/admin/companies/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedCompany = response.data.company; // Giả sử server trả về công ty đã cập nhật
      setCompanies(
        companies.map((company) =>
          company._id === id ? { ...company, status: "approved" } : company
        )
      );
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi khi duyệt công ty");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/admin/companies/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedCompany = response.data.company; // Giả sử server trả về công ty đã cập nhật
      setCompanies(
        companies.map((company) =>
          company._id === id ? { ...company, status: "rejected" } : company
        )
      );
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi khi từ chối công ty");
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/companies/${id}`);
  };

  const columns = [
    { title: "Tên công ty", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record._id)}
            style={{ marginRight: 8 }}
          >
            Xem
          </Button>
          <Button
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record._id)}
            disabled={record.status === "approved"}
            style={{ marginRight: 8 }}
          >
            Duyệt
          </Button>
          <Button
            icon={<CloseOutlined />}
            onClick={() => handleReject(record._id)}
            disabled={record.status === "rejected"}
            danger
          >
            Từ chối
          </Button>
        </>
      ),
    },
  ];

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-employers-page">
      <h2>Quản lý nhà tuyển dụng</h2>
      <Table
        columns={columns}
        dataSource={companies}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AdminEmployersPage;
