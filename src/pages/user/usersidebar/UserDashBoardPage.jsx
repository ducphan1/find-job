import React, { useEffect, useState } from "react";
import "../../../styles/UserDashboardPage.css";
import { Row, Col, Button, message } from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";
import axios from "axios";
import cvImage from "../../../assets/cv.jpg";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const UserDashboardPage = () => {
  const [socket, setSocket] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.warning("Bạn chưa đăng nhập!");
        return;
      }

      const res = await axios.get(`${API_URL}/cv`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Dữ liệu CV từ API:", res.data);
      setCvs(res.data.cvs || []);
    } catch (error) {
      console.error("Error fetching CVs:", error.response?.data || error);
      if (error.response?.status === 404) {
        setCvs([]); // Không có CV, để mảng rỗng thay vì báo lỗi
      } else {
        message.error("Không thể tải danh sách CV!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCV = async (cvId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/cv/${cvId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCvs(cvs.filter((cv) => cv._id !== cvId));
      message.success("Đã xóa CV thành công!");
    } catch (error) {
      message.error(error.response?.data?.message || "Xóa CV thất bại!");
    }
  };

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${localStorage.getItem("token")}` },
      reconnection: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("notification", (notification) => {
      console.log("Received notification:", notification);
      if (notification.type === "cv_viewed") {
        message.info("CV của bạn vừa được nhà tuyển dụng xem!");
      } else if (notification.type === "application_rejected") {
        message.error("Ứng tuyển của bạn đã bị từ chối!");
      } else if (
        notification.type === "cv_created" ||
        notification.type === "cv_deleted"
      ) {
        fetchCVs();
        message.success(notification.message);
      } else {
        message.info(`Thông báo: ${notification.message}`);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    fetchCVs();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div>
      <div className="main-content-row">
        <div className="main-content-col">
          <div className="online-header">
            <div className="online-header-title">
              <i className="fas fa-file-alt"></i> Hồ sơ online
            </div>
            <a href="#" className="online-header-link">
              Cập nhật hồ sơ
            </a>
          </div>
          <div className="online-desc">
            Chọn mẫu giao diện cho hồ sơ của bạn
          </div>
          <div className="online-content">
            <img src={cvImage} alt="CV Demo" className="online-image" />
            <div>
              <h4 className="online-detail-title">Mẫu hiện đại</h4>
              <div className="online-detail-status">Đang chọn</div>
              <p>
                Bố cục hiện đại & rõ ràng, không cầu kỳ nhưng chuyên nghiệp. Phù
                hợp với người có cá tính riêng.
              </p>
              <Button type="primary" className="btn-cv-other">
                Xem các mẫu CV khác
              </Button>
            </div>
          </div>
        </div>

        <div className="main-content-col">
          <div className="attach-header">
            <i className="fas fa-paperclip"></i> Hồ sơ đính kèm
          </div>
          <div className="attach-desc">
            Ngoài hồ sơ online, bạn có thể đính kèm 5 hồ sơ offline (Tối đa 5 hồ
            sơ)
          </div>

          {loading ? (
            <p>Đang tải...</p>
          ) : cvs.length > 0 ? (
            cvs.map((cv) => (
              <div className="attach-item" key={cv._id}>
                <div className="attach-file-name">
                  {cv.hoTen ? `${cv.hoTen} - CV` : "CV không có tên"} (Mã:{" "}
                  {cv.maHoSo})
                </div>
                <div className="attach-actions">
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => alert("Chức năng xem CV đang phát triển!")}
                  >
                    Xem
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => alert("Chức năng tải CV đang phát triển!")}
                  >
                    Tải xuống
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteCV(cv._id)}
                  >
                    Xoá
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p>Chưa có CV nào được tạo.</p>
          )}
          <Button style={{ marginTop: 10 }}>Tải hồ sơ lên</Button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
