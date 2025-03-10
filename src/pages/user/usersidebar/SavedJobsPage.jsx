import React, { useEffect, useState } from "react";
import { Table, Input, message, Button } from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { io } from "socket.io-client"; // Thêm import Socket.IO
import "../../../styles/SavedJobsPage.css";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const SavedJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null); // State để quản lý Socket.IO

  const getSalaryLabel = (salaryNum) => {
    if (!salaryNum || salaryNum < 0) return "Thỏa thuận";
    if (salaryNum <= 5000000) return "Dưới 5 triệu";
    if (salaryNum <= 10000000) return "5 - 10 triệu";
    if (salaryNum <= 12000000) return "10 - 12 triệu";
    if (salaryNum <= 15000000) return "12 - 15 triệu";
    if (salaryNum >= 20000000) return "Trên 15 triệu";
    return "Thỏa thuận";
  };

  const formatLocation = (location) => {
    if (!location) return "Chưa cập nhật";
    const cleanLocation = location.replace(/<[^>]+>/g, "").trim();
    const parts = cleanLocation.split(",").map((part) => part.trim());
    return parts.length > 2 ? `${parts[0]}, ${parts[1]}` : cleanLocation;
  };

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.warning("Bạn chưa đăng nhập!");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/jobs/saved", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Dữ liệu từ API /api/jobs/saved:", res.data);
      setJobs(res.data.savedJobs || []);
    } catch (error) {
      console.error(
        "Error fetching saved jobs:",
        error.response?.data || error
      );
      message.error("Không thể tải danh sách việc làm đã lưu!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Khởi tạo Socket.IO
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${localStorage.getItem("token")}` },
      reconnection: true,
    });
    setSocket(newSocket);

    // Lắng nghe sự kiện kết nối
    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    // Lắng nghe thông báo từ server
    newSocket.on("notification", (notification) => {
      message.info(`Thông báo: ${notification.message}`);
      if (
        notification.type === "job_saved" ||
        notification.type === "application_added"
      ) {
        fetchSavedJobs(); // Cập nhật lại danh sách nếu có thay đổi liên quan
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    // Lấy danh sách công việc đã lưu
    fetchSavedJobs();

    window.addEventListener("jobSaved", fetchSavedJobs);
    window.addEventListener("jobRemoved", fetchSavedJobs);

    // Dọn dẹp
    return () => {
      newSocket.disconnect();
      window.removeEventListener("jobSaved", fetchSavedJobs);
      window.removeEventListener("jobRemoved", fetchSavedJobs);
    };
  }, []);

  const handleRemoveJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/jobs/save", {
        headers: { Authorization: `Bearer ${token}` },
        data: { jobId },
      });
      setJobs(jobs.filter((job) => job._id !== jobId));
      message.success("Đã xóa công việc khỏi danh sách lưu.");
      window.dispatchEvent(new Event("jobRemoved"));
    } catch (error) {
      message.error(error.response?.data?.message || "Xóa công việc thất bại.");
    }
  };

  const handleApplyJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.warning("Bạn cần đăng nhập để ứng tuyển!");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/application",
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Ứng tuyển thành công!");
    } catch (error) {
      message.error(error.response?.data?.message || "Ứng tuyển thất bại.");
    }
  };

  const columns = [
    {
      title: "Vị trí / Nhà tuyển dụng",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.title}</div>
          <div style={{ fontSize: 13, color: "#666" }}>
            {record.company?.name || "Không xác định"}
          </div>
        </div>
      ),
    },
    {
      title: "Nơi làm việc",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (text) => formatLocation(text),
    },
    {
      title: "Mức lương",
      dataIndex: "salary",
      key: "salary",
      width: 120,
      render: (salary) => getSalaryLabel(salary),
    },
    {
      title: "Hạn nộp HS",
      dataIndex: "deadline",
      key: "deadline",
      width: 120,
      render: (deadline) =>
        deadline ? moment.unix(deadline).format("DD-MM-YYYY") : "Chưa cập nhật",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="primary"
            icon={<FileDoneOutlined />}
            onClick={() => handleApplyJob(record._id)}
          >
            Ứng tuyển
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveJob(record._id)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = jobs.filter((job) => {
    const fullTitle = `${job.title} ${job.company?.name || ""}`.toLowerCase();
    return fullTitle.includes(searchText.toLowerCase());
  });

  return (
    <div className="saved-jobs-container">
      <div className="saved-jobs-header">
        <h2>Danh sách việc làm đã lưu</h2>
        <Input
          placeholder="Tìm kiếm"
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={(record) => record._id || record.key}
        pagination={{ pageSize: 5 }}
        loading={loading}
        locale={{ emptyText: "Bạn chưa lưu công việc nào." }}
        className="saved-jobs-table"
      />
    </div>
  );
};

export default SavedJobsPage;
