import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, message, Modal, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"; // Thêm Socket.IO client

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [socket, setSocket] = useState(null); // State cho kết nối Socket.IO

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"; // URL Socket.IO

  // Thiết lập Socket.IO và lấy danh sách người dùng
  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` }, // Xác thực bằng token
    });
    setSocket(newSocket);

    // Lắng nghe thông báo từ server
    newSocket.on("notification", (data) => {
      if (data.type === "user_added") {
        message.success(`Thông báo: ${data.message}`);
        setUsers((prev) => [...prev, data.user]); // Thêm người dùng mới vào danh sách
      } else if (data.type === "user_updated" && data.user) {
        message.info(`Thông báo: ${data.message}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === data.user._id ? data.user : u))
        ); // Cập nhật thông tin người dùng
      } else if (data.type === "user_deleted" && data.userId) {
        message.warning(`Thông báo: ${data.message}`);
        setUsers((prev) => prev.filter((u) => u._id !== data.userId)); // Xóa người dùng
      } else if (data.type === "account_locked" && data.userId) {
        message.info(`Thông báo: ${data.message}`);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === data.userId ? { ...u, isLocked: data.isLocked } : u
          )
        ); // Cập nhật trạng thái khóa
      }
    });

    // Lấy danh sách người dùng ban đầu
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Danh sách người dùng từ API /admin/users:", response.data);
        setUsers(response.data);
      } catch (error) {
        message.error("Lỗi khi lấy danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // Dọn dẹp khi component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [API_URL]);

  // Xử lý khóa/mở khóa tài khoản
  const handleLock = async (userId, isLocked) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/admin/users/${userId}/lock`,
        { isLocked: !isLocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(
        `Tài khoản đã được ${isLocked ? "mở khóa" : "khóa"} thành công`
      );
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isLocked: !isLocked } : user
        )
      );
    } catch (error) {
      message.error("Lỗi khi khóa/mở khóa tài khoản");
    }
  };

  // Xử lý xóa tài khoản
  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Tài khoản đã được xóa thành công");
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      message.error("Lỗi khi xóa tài khoản");
    }
  };

  // Mở modal thêm người dùng
  const showAddModal = () => {
    setIsAddModalOpen(true);
    form.resetFields();
  };

  // Xử lý thêm người dùng
  const handleAdd = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/admin/users`,
        {
          name: values.name,
          email: values.email,
          role: values.role || "user",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Thêm người dùng thành công");
      setIsAddModalOpen(false);
      setUsers((prev) => [...prev, response.data]); // Cập nhật UI ngay lập tức
    } catch (error) {
      message.error("Lỗi khi thêm người dùng");
    }
  };

  // Mở modal sửa người dùng
  const showEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  // Xử lý sửa người dùng
  const handleEdit = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/admin/users/${selectedUser._id}`,
        {
          name: values.name,
          email: values.email,
          role: values.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Cập nhật người dùng thành công");
      setIsEditModalOpen(false);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === selectedUser._id ? response.data : user
        )
      ); // Cập nhật UI ngay lập tức
    } catch (error) {
      message.error("Lỗi khi cập nhật người dùng");
    }
  };

  // Cột cho bảng
  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Quyền",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Trạng thái",
      dataIndex: "isLocked",
      key: "isLocked",
      render: (isLocked) => (isLocked ? "Đã khóa" : "Hoạt động"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <span>
          {record.role !== "admin" ? (
            <>
              <Button
                type="primary"
                onClick={() => handleLock(record._id, record.isLocked)}
                style={{ marginRight: 8 }}
              >
                {record.isLocked ? "Mở khóa" : "Khóa"}
              </Button>
              <Button
                type="danger"
                onClick={() => handleDelete(record._id)}
                style={{ marginRight: 8 }}
              >
                Xóa
              </Button>
              <Button type="default" onClick={() => showEditModal(record)}>
                Sửa
              </Button>
            </>
          ) : (
            <span>Không thể chỉnh sửa tài khoản admin</span>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-users-page">
      <h2>Quản lý người dùng</h2>
      <Button
        type="primary"
        onClick={showAddModal}
        style={{ marginBottom: 16 }}
      >
        Thêm người dùng
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
      />

      {/* Modal thêm người dùng */}
      <Modal
        title="Thêm người dùng mới"
        open={isAddModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsAddModalOpen(false)}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item
            name="name"
            label="Tên người dùng"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Quyền"
            rules={[{ required: true, message: "Vui lòng chọn quyền!" }]}
          >
            <Input placeholder="user hoặc admin" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal sửa người dùng */}
      <Modal
        title="Sửa thông tin người dùng"
        open={isEditModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsEditModalOpen(false)}
      >
        <Form form={form} onFinish={handleEdit} layout="vertical">
          <Form.Item
            name="name"
            label="Tên người dùng"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Quyền"
            rules={[{ required: true, message: "Vui lòng chọn quyền!" }]}
          >
            <Input placeholder="user hoặc admin" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
