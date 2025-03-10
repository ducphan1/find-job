import React, { useEffect, useState, useCallback } from "react";
import { Modal, Row, Col, Card, Button, Divider, message } from "antd";
import {
  MoneyCollectOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  TeamOutlined,
  ClusterOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SolutionOutlined,
  ProfileOutlined,
  IdcardOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import parse from "html-react-parser";
import axios from "axios";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import moment from "moment";
import "../styles/JobDetailModal.css";

const getSalaryLabel = (salaryNum) => {
  if (!salaryNum || salaryNum < 0) return "Thỏa thuận";
  if (salaryNum <= 5000000) return "Dưới 5 triệu";
  if (salaryNum <= 10000000) return "5 - 10 triệu";
  if (salaryNum <= 12000000) return "10 - 12 triệu";
  if (salaryNum <= 15000000) return "12 - 15 triệu";
  if (salaryNum >= 20000000) return "Trên 15 triệu";
  return "Thỏa thuận";
};

const cleanHtml = (html) => {
  if (!html) return "Chưa cập nhật";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const selectAuth = createSelector(
  (state) => state.auth,
  (auth) => auth || {}
);

const JobDetailModal = ({ visible, onCancel, setOpenModal, initialJob }) => {
  const { user, isAuthenticated } = useSelector(selectAuth);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null); // Thêm state cho WebSocket

  // Khởi tạo WebSocket khi component mount
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:5000?token=${token}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      console.log("Received WebSocket notification:", notification);
      // Hiển thị thông báo bằng antd message
      if (notification.type === "application_accepted") {
        message.success(notification.message);
      } else if (notification.type === "application_rejected") {
        message.error(notification.message);
      } else {
        message.info(notification.message);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Cleanup khi component unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    console.log("Giá trị initialJob nhận được:", initialJob);
    if (visible && initialJob && initialJob.company) {
      console.log("Cập nhật selectedJob và selectedCompany từ initialJob...");
      setSelectedJob(initialJob);
      setSelectedCompany(initialJob.company);
    } else if (!visible) {
      console.log("Modal đóng, reset selectedJob và selectedCompany...");
      setSelectedJob(null);
      setSelectedCompany(null);
    }
  }, [initialJob, visible]);

  const openModal = useCallback((job, company) => {
    console.log("Mở modal với job:", job);
    setSelectedJob(job);
    setSelectedCompany(company || job.company);
  }, []);

  useEffect(() => {
    if (setOpenModal) {
      setOpenModal(openModal);
    }
  }, [setOpenModal, openModal]);

  useEffect(() => {
    if (visible) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.overflow = "auto";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.overflow = "auto";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    };
  }, [visible]);

  useEffect(() => {
    const fetchRelatedJobs = async () => {
      if (!selectedCompany?._id || !visible) {
        console.log(
          "Không có company ID hoặc modal không hiển thị, bỏ qua fetch."
        );
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/jobs?companyId=${selectedCompany._id}`
        );
        console.log("Phản hồi công việc liên quan:", response.data);
        const filteredJobs = response.data.filter(
          (relatedJob) => relatedJob._id !== selectedJob._id
        );
        setRelatedJobs(filteredJobs);
      } catch (error) {
        console.error("Lỗi khi fetch công việc liên quan:", error.message);
        message.error("Không thể tải danh sách công việc cùng công ty.");
      } finally {
        setLoading(false);
      }
    };
    fetchRelatedJobs();
  }, [selectedCompany, selectedJob, visible]);

  const handleViewDetail = (relatedJob) => {
    console.log("Xem chi tiết công việc:", relatedJob);
    setSelectedJob(relatedJob);
    setSelectedCompany(relatedJob.company || selectedCompany);
  };

  const handleSaveJob = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Bạn cần đăng nhập để lưu tin.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/jobs/save",
        { jobId: selectedJob._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Đã lưu công việc thành công!");
      window.dispatchEvent(new Event("jobSaved"));
    } catch (error) {
      message.error(error.response?.data?.message || "Lưu công việc thất bại.");
    }
  };

  const handleApply = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Bạn cần đăng nhập để ứng tuyển.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/application",
        {
          jobId: selectedJob._id,
          cvId: null, // Có thể thêm logic chọn CV nếu cần
          coverLetter: "", // Có thể thêm field nhập thư ứng tuyển
          expectedSalary: selectedJob.salary || -1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Response từ ứng tuyển:", response.data);
      message.success("Ứng tuyển thành công!");
      window.dispatchEvent(new Event("jobApplied"));
    } catch (error) {
      console.error("Error applying job:", error.response?.data || error);
      const errorMsg = error.response?.data?.message || "Ứng tuyển thất bại.";
      message.error(errorMsg);
    }
  };

  if (!selectedJob || !selectedCompany) {
    console.log("selectedJob hoặc selectedCompany là null:", {
      selectedJob,
      selectedCompany,
    });
    return (
      <Modal open={visible} onCancel={onCancel} footer={null} width={1400}>
        <p>Đang tải dữ liệu...</p>
      </Modal>
    );
  }

  const cleanLocation = cleanHtml(selectedJob.location);
  const cleanContactName = cleanHtml(selectedJob.contact?.name);
  const cleanContactPhone = cleanHtml(selectedJob.contact?.phone);
  const cleanContactEmail = cleanHtml(selectedJob.contact?.email);
  const cleanAddress = selectedJob.location || "Chưa cập nhật";
  const displaySalary = getSalaryLabel(selectedJob.salary);
  const verificationLabel =
    selectedJob.status === "approved" ? "ĐÃ XÁC THỰC" : "CHƯA XÁC THỰC";

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1400}
      className="job-detail-modal2"
      style={{ top: 20 }}
    >
      <div className="job-header-section2">
        <Row justify="space-between" align="middle">
          <Col xs={24} md={16}>
            <Row gutter={16} align="middle">
              <Col flex="80px">
                <img
                  src={selectedCompany.logo || "/default-logo.png"}
                  alt="Company Logo"
                  className="company-logo2"
                  onError={(e) => (e.target.src = "/default-logo.png")}
                />
              </Col>
              <Col flex="auto">
                <h2 className="job-title2">{selectedJob.title}</h2>
                <div className="company-name2">{selectedCompany.name}</div>
                <div className="company-address2">
                  {selectedCompany.address || "Chưa cập nhật địa chỉ"}
                </div>
              </Col>
            </Row>
          </Col>
          <Col xs={24} md={8} className="header-actions-col2">
            <div className="header-actions2">
              <Button
                type="primary"
                className="apply-button2"
                onClick={handleApply}
              >
                Nộp hồ sơ
              </Button>
              <Button className="save-button2" onClick={handleSaveJob}>
                Lưu tin
              </Button>
              <div
                className={`certified-stamp2 ${selectedJob.status !== "approved" ? "unverified2" : ""}`}
              >
                {verificationLabel}
              </div>
            </div>
          </Col>
        </Row>
      </div>
      <Divider />
      <div className="job-summary-section2">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <SolutionOutlined /> <strong>Kinh nghiệm:</strong>{" "}
            {selectedJob.experience || "Chưa cập nhật"}
          </Col>
          <Col xs={24} sm={12} md={8}>
            <IdcardOutlined /> <strong>Yêu cầu bằng cấp:</strong>{" "}
            {selectedJob.education || "Chưa cập nhật"}
          </Col>
          <Col xs={24} sm={12} md={8}>
            <TeamOutlined /> <strong>Số lượng cần tuyển:</strong>{" "}
            {selectedJob.quantity || "Chưa cập nhật"}
          </Col>
          <Col xs={24} sm={12} md={8}>
            <ClusterOutlined /> <strong>Ngành nghề:</strong>{" "}
            {selectedJob.category || "Chưa cập nhật"}
          </Col>
          <Col xs={24} sm={12} md={8}>
            <ProfileOutlined /> <strong>Chức vụ:</strong>{" "}
            {selectedJob.position || "Chưa cập nhật"}
          </Col>
          <Col xs={24} sm={12} md={8}>
            <ClockCircleOutlined /> <strong>Hình thức làm việc:</strong>{" "}
            {selectedJob.workTime || "Chưa cập nhật"}
          </Col>
          <Col xs={24} sm={12} md={8}>
            <EnvironmentOutlined /> <strong>Địa điểm làm việc:</strong>{" "}
            {cleanLocation}
          </Col>
          <Col xs={24} sm={12} md={8}>
            <CalendarOutlined /> <strong>Hạn nộp hồ sơ:</strong>{" "}
            {selectedJob.deadline
              ? moment(selectedJob.deadline, "DD-MM-YYYY").format("DD-MM-YYYY")
              : "Chưa cập nhật"}
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MoneyCollectOutlined /> <strong>Mức lương:</strong> {displaySalary}
          </Col>
        </Row>
      </div>
      <Divider />
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <h3>Mô tả công việc</h3>
          <div>{parse(selectedJob.description || "Chưa cập nhật")}</div>
          <Divider />
          <h3>Yêu cầu công việc</h3>
          <div>{parse(selectedJob.requirement || "Chưa cập nhật")}</div>
          <Divider />
          <h3>Quyền lợi & Chế độ</h3>
          <div>{parse(selectedJob.benefit || "Chưa cập nhật")}</div>
          <Divider />
          <h3>Yêu cầu hồ sơ</h3>
          <div>{parse(selectedJob.profile || "Chưa cập nhật")}</div>
          <Divider />
          <h3>Thông tin liên hệ</h3>
          <p>
            <UserOutlined /> <strong>Tên người liên hệ:</strong>{" "}
            {cleanContactName}
          </p>
          <p>
            <PhoneOutlined /> <strong>Số điện thoại:</strong>{" "}
            {cleanContactPhone}
          </p>
          <p>
            <ShopOutlined /> <strong>Địa chỉ:</strong> {parse(cleanAddress)}
          </p>
          <p>
            <MailOutlined /> <strong>Email:</strong> {cleanContactEmail}
          </p>
        </Col>
        <Col xs={24} md={8}>
          <Card title="THÔNG TIN CÔNG TY" className="company-info-card2">
            <p>
              <EnvironmentOutlined /> <strong>Địa chỉ:</strong>{" "}
              {selectedCompany.address || "Chưa cập nhật"}
            </p>
            <p>
              <GlobalOutlined /> <strong>Website:</strong>{" "}
              {selectedCompany.website || "Chưa cập nhật"}
            </p>
            <p>
              <PhoneOutlined /> <strong>Điện thoại:</strong>{" "}
              {selectedCompany.phone || "Chưa cập nhật"}
            </p>
            <p>
              <ClusterOutlined /> <strong>Lĩnh vực:</strong>{" "}
              {selectedCompany.industry || "Chưa cập nhật"}
            </p>
            {selectedCompany.map && (
              <div className="map-wrapper2">
                <iframe
                  title="map"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(selectedCompany.map)}&output=embed`}
                  allowFullScreen
                ></iframe>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(selectedCompany.map)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link2"
                >
                  Xem bản đồ lớn hơn
                </a>
              </div>
            )}
          </Card>
          <Card title="VIỆC LÀM CÓ LIÊN QUAN" className="company-info-card2">
            {loading ? (
              <p>Đang tải...</p>
            ) : relatedJobs.length > 0 ? (
              relatedJobs.map((relatedJob) => (
                <div key={relatedJob._id} className="related-job-item2">
                  <div className="related-job-info2">
                    <h4>{relatedJob.title}</h4>
                    <p>
                      <EnvironmentOutlined />{" "}
                      {cleanHtml(relatedJob.location) || "Chưa cập nhật"}
                    </p>
                    <p>
                      <MoneyCollectOutlined />{" "}
                      {getSalaryLabel(relatedJob.salary)}
                    </p>
                  </div>
                  <Button
                    type="link"
                    onClick={() => handleViewDetail(relatedJob)}
                    className="view-detail-button2"
                  >
                    <EyeOutlined /> Xem chi tiết
                  </Button>
                </div>
              ))
            ) : (
              <p>Không có công việc nào khác từ công ty này.</p>
            )}
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default JobDetailModal;
