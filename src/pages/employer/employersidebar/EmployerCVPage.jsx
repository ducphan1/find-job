import React, { useState, useEffect } from "react";
import { Table, Input, Button, Modal, Space, message } from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import io from "socket.io-client";
import "../../../styles/EmployerDashboardPage.css";

const socket = io("http://localhost:5000", {
  auth: { token: `Bearer ${localStorage.getItem("token")}` },
});

const EmployerCVPage = () => {
  const [searchText, setSearchText] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Vui lòng đăng nhập trước!");
      return;
    }

    const userId = JSON.parse(atob(token.split(".")[1])).id;
    socket.emit("register", userId);

    socket.on("notification", (data) => {
      if (data.type === "application_updated" && data.application) {
        message.info(`Thông báo: ${data.message}`);
        setApplications((prev) =>
          prev.map((app) =>
            app._id === data.application._id ? data.application : app
          )
        );
      } else if (data.type === "application_deleted" && data.applicationId) {
        message.warning(`Thông báo: ${data.message}`);
        setApplications((prev) =>
          prev.filter((app) => app._id !== data.applicationId)
        );
      } else if (data.type === "application_added" && data.application) {
        message.success(`Thông báo: ${data.message}`);
        setApplications((prev) => [...prev, data.application]);
      }
    });

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/application/my-applications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Applications fetched:", response.data);
        setApplications(response.data);
      } catch (error) {
        message.error(
          error.response?.data?.message || "Không thể tải danh sách ứng tuyển!"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();

    return () => {
      socket.off("notification");
    };
  }, []);

  const filteredData = applications
    .filter(
      (item) =>
        (item.user?.name || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (item.job?.title || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (item.job?.company?.name || "")
          .toLowerCase()
          .includes(searchText.toLowerCase())
    )
    .map((item) => ({
      key: item._id,
      candidateName: item.user?.name || "Chưa cập nhật",
      position: item.job?.title || "Chưa cập nhật",
      company: item.job?.company?.name || "Chưa cập nhật",
      submissionDate: item.appliedAt
        ? new Date(item.appliedAt).toLocaleDateString()
        : "Chưa cập nhật",
      status: item.status || "Chưa cập nhật",
      cvLink: item.cv?.fileUrl || "#",
    }));

  const columns = [
    { title: "Tên ứng viên", dataIndex: "candidateName", key: "candidateName" },
    { title: "Vị trí", dataIndex: "position", key: "position" },
    { title: "Công ty", dataIndex: "company", key: "company" },
    { title: "Ngày nộp", dataIndex: "submissionDate", key: "submissionDate" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            Tải xuống
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleReject(record)}
            disabled={
              record.status === "rejected" || record.status === "accepted"
            }
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = async (record) => {
    try {
      const token = localStorage.getItem("token");

      const url = `http://localhost:5000/api/applications/view-cv/${record.key}`;
      console.log("Requesting URL:", url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedCV({
        ...record,
        fileUrl: response.data.cv.fileUrl,
        fileName: response.data.cv.fileName,
      });
      setModalVisible(true);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === record.key ? { ...app, status: "reviewing" } : app
        )
      );
      message.success("Đã xem CV thành công.");
    } catch (error) {
      console.error("Error viewing CV:", error.response?.data);
      message.error(error.response?.data?.message || "Không thể xem CV.");
    }
  };

  const handleDownload = (record) => {
    if (record.cvLink && record.cvLink !== "#") {
      window.open(record.cvLink, "_blank");
      message.success(`Đã mở CV của ${record.candidateName} để tải xuống.`);
    } else {
      message.warning("Không có CV để tải xuống.");
    }
  };

  const handleDelete = async (record) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/application/${record.key}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications((prev) => prev.filter((app) => app._id !== record.key));
      message.success(`Đã xóa CV của ${record.candidateName}`);
    } catch (error) {
      message.error("Xóa CV thất bại.");
    }
  };

  const handleReject = async (record) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:5000/api/application/${record.key}`,
        { status: "rejected" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === record.key ? { ...app, status: "rejected" } : app
        )
      );
      message.success(`Đã từ chối ứng viên ${record.candidateName}`);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Từ chối ứng viên thất bại."
      );
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý CV</h2>
      <p>Danh sách hồ sơ ứng viên mà bạn nhận được.</p>
      <Input.Search
        placeholder="Tìm kiếm theo tên ứng viên, vị trí hoặc công ty..."
        onSearch={(value) => setSearchText(value)}
        onChange={(e) => setSearchText(e.target.value)}
        enterButton
        style={{ marginBottom: 20, maxWidth: 400 }}
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        locale={{ emptyText: "Không có dữ liệu CV ứng tuyển" }}
      />
      <Modal
        title="Chi tiết hồ sơ"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(selectedCV)}
          >
            Tải xuống
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={800} // Tăng chiều rộng modal để hiển thị CV tốt hơn
      >
        {selectedCV && (
          <div>
            <p>
              <strong>Tên ứng viên:</strong> {selectedCV.candidateName}
            </p>
            <p>
              <strong>Vị trí ứng tuyển:</strong> {selectedCV.position}
            </p>
            <p>
              <strong>Công ty:</strong> {selectedCV.company}
            </p>
            <p>
              <strong>Ngày nộp:</strong> {selectedCV.submissionDate}
            </p>
            <p>
              <strong>Trạng thái:</strong> {selectedCV.status}
            </p>
            {selectedCV.fileUrl && selectedCV.fileUrl !== "#" && (
              <div>
                <strong>CV:</strong>
                <iframe
                  src={selectedCV.fileUrl}
                  width="100%"
                  height="500px"
                  title="CV Preview"
                  style={{ border: "1px solid #d9d9d9", marginTop: 10 }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployerCVPage;
