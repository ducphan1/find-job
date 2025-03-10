import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Radio,
  message,
  Modal,
  Badge,
  Popover,
  List,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
} from "@ant-design/icons";
import axios from "axios";
import socket from "../../../socket.js"; // Sử dụng instance chung
import dayjs from "dayjs";

const AppliedJobsPage = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getSalaryLabel = (salaryNum) => {
    if (!salaryNum || salaryNum < 0) return "Thỏa thuận";
    if (salaryNum <= 5000000) return "Dưới 5 triệu";
    if (salaryNum <= 10000000) return "5 - 10 triệu";
    if (salaryNum <= 12000000) return "10 - 12 triệu";
    if (salaryNum <= 15000000) return "12 - 15 triệu";
    if (salaryNum >= 20000000) return "Trên 15 triệu";
    return "Thỏa thuận";
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.warning("Bạn chưa đăng nhập!");
        return;
      }
      const res = await axios.get("http://localhost:5000/api/application", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.applications || []);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể tải danh sách việc đã nộp!"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.notifications.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Bạn chưa đăng nhập!");
      return;
    }

    const userId = JSON.parse(atob(token.split(".")[1])).id;
    socket.emit("register", userId);

    fetchApplications();
    fetchNotifications();

    socket.on("notification", (notification) => {
      console.log("Received notification in AppliedJobsPage:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      if (notification.application) {
        setData((prevData) =>
          prevData.map((app) =>
            app._id === notification.application
              ? {
                  ...app,
                  status:
                    notification.type === "cv_viewed"
                      ? "reviewing"
                      : "rejected",
                }
              : app
          )
        );
      }
      message.info(notification.message);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const handleView = (record) => {
    setSelectedApplication(record);
    setViewModalVisible(true);
  };

  const handleEdit = (record) => {
    console.log("Sửa ứng tuyển:", record);
    message.info("Chức năng chỉnh sửa đang phát triển.");
  };

  const handleDelete = async (record) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/application/${record._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(data.filter((app) => app._id !== record._id));
      message.success("Đã xóa ứng tuyển thành công!");
    } catch (error) {
      message.error(error.response?.data?.message || "Xóa ứng tuyển thất bại!");
    }
  };

  const columns = [
    {
      title: "Vị trí / Nhà tuyển dụng",
      dataIndex: "job",
      key: "job",
      render: (job) => job?.title || "N/A",
    },
    {
      title: "Mức lương",
      dataIndex: "expectedSalary",
      key: "salary",
      width: 120,
      render: (salary) => getSalaryLabel(salary),
    },
    {
      title: "Ngày nộp hồ sơ",
      dataIndex: "appliedAt",
      key: "appliedAt",
      width: 120,
      render: (appliedAt) => dayjs(appliedAt).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (text) => {
        if (text === "applied") return <Tag color="blue">Chưa xem</Tag>;
        if (text === "reviewing" || text === "seen")
          return <Tag color="green">Đã xem</Tag>;
        if (text === "rejected") return <Tag color="red">Từ chối</Tag>;
        if (text === "accepted") return <Tag color="gold">Đã nhận</Tag>;
        return <Tag color="default">{text}</Tag>;
      },
    },
    {
      title: "",
      key: "action",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            Xem
          </Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xoá
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = data.filter((app) => {
    const status = app.status;
    const appliedAt = dayjs(app.appliedAt);

    if (filter === "all") return true;
    if (filter === "30days") {
      const diffDays = dayjs().diff(appliedAt, "day");
      return diffDays <= 30;
    }
    if (filter === "seen") return status === "reviewing" || status === "seen";
    if (filter === "unseen") return status === "applied";
    return true;
  });

  const notificationContent = (
    <List
      dataSource={notifications}
      renderItem={(item) => (
        <List.Item>
          <div>
            {item.message}
            {!item.read && (
              <Button type="link" onClick={() => markAsRead(item._id)}>
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        </List.Item>
      )}
    />
  );

  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 8,
        minHeight: "80vh",
        textWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          textWrap: "nowrap",
          marginBottom: 20,
        }}
      >
        <h2>Danh sách việc đã nộp</h2>
        <Popover
          content={notificationContent}
          title="Thông báo"
          trigger="click"
        >
          <Badge count={unreadCount}>
            <BellOutlined style={{ fontSize: 24 }} />
          </Badge>
        </Popover>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Radio.Group value={filter} onChange={(e) => setFilter(e.target.value)}>
          <Radio.Button value="all">Tất cả</Radio.Button>
          <Radio.Button value="30days">Trong vòng 30 ngày</Radio.Button>
          <Radio.Button value="seen">Đã xem</Radio.Button>
          <Radio.Button value="unseen">Chưa xem</Radio.Button>
        </Radio.Group>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 5 }}
        loading={loading}
        locale={{ emptyText: "Bạn chưa ứng tuyển công việc nào." }}
      />
      <Modal
        title="Chi tiết ứng tuyển"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setViewModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
      >
        {selectedApplication && (
          <div>
            <p>
              <strong>Vị trí:</strong> {selectedApplication.job?.title || "N/A"}
            </p>
            <p>
              <strong>Công ty:</strong>{" "}
              {selectedApplication.job?.company?.name || "N/A"}
            </p>
            <p>
              <strong>Mức lương mong muốn:</strong>{" "}
              {getSalaryLabel(selectedApplication.expectedSalary)}
            </p>
            <p>
              <strong>Ngày nộp hồ sơ:</strong>{" "}
              {dayjs(selectedApplication.appliedAt).format("DD/MM/YYYY HH:mm")}
            </p>
            <p>
              <strong>Trạng thái:</strong> {selectedApplication.status || "N/A"}
            </p>
            <p>
              <strong>Thư ứng tuyển:</strong>{" "}
              {selectedApplication.coverLetter || "Không có"}
            </p>
            {selectedApplication.cv && (
              <p>
                <strong>CV:</strong>{" "}
                <a
                  href={selectedApplication.cv.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedApplication.cv.fileName || "Xem CV"}
                </a>
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppliedJobsPage;
