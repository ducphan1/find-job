import React, { useState } from "react";
import { Modal, Row, Col, Card, Button, Divider } from "antd";
import {
  MoneyCollectOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  PhoneOutlined,
  TeamOutlined,
  ClusterOutlined,
} from "@ant-design/icons";
import "../styles/JobDetailModal.css";

const JobDetailModal = ({ visible, onCancel, job, company }) => {
  const [selectedJob, setSelectedJob] = useState(job);

  if (!selectedJob || !company) return null;

  const otherJobs =
    company.jobs?.filter((j) => j.title !== selectedJob.title) || [];

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      className="job-detail-modal"
    >
      <div className="modal-header">
        <h2>{selectedJob.title}</h2>
      </div>

      <div className="modal-body-content">
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <div className="job-info">
              <strong>{company.name}</strong> -{" "}
              {company.address || "Chưa cập nhật địa chỉ"}
            </div>
            <div className="job-meta">
              <MoneyCollectOutlined />
              <span>
                Mức lương: <strong>{selectedJob.salary || "Thoả thuận"}</strong>
              </span>
              <span>|</span>
              <CalendarOutlined />
              <span>
                Hạn tuyển:{" "}
                <strong>{selectedJob.deadline || "Chưa cập nhật"}</strong>
              </span>
              <span>|</span>
              <EnvironmentOutlined />
              <span>
                Khu vực:{" "}
                <strong>{selectedJob.location || "Chưa cập nhật"}</strong>
              </span>
            </div>

            <Divider />
            <h3>Mô tả công việc</h3>
            <p>{selectedJob.description || "- Chưa cập nhật mô tả -"}</p>

            <Divider />
            <h3>Yêu cầu công việc</h3>
            <p>{selectedJob.requirement || "- Chưa cập nhật yêu cầu -"}</p>

            <Divider />
            <h3>Quyền lợi & Chế độ</h3>
            <p>{selectedJob.benefit || "- Chưa cập nhật quyền lợi -"}</p>

            <Divider />
            <h3>Yêu cầu hồ sơ</h3>
            <p>{selectedJob.profile || "- Chưa cập nhật hồ sơ -"}</p>
          </Col>

          <Col xs={24} md={8}>
            <div className="company-actions-box">
              <Button type="primary" block style={{ marginBottom: 8 }}>
                Nộp hồ sơ
              </Button>
              <Button block style={{ marginBottom: 8 }}>
                Lưu tin
              </Button>
              <Button type="dashed" block>
                Nhắn tin
              </Button>
            </div>

            <Card
              title="THÔNG TIN CÔNG TY"
              style={{ marginBottom: 16, marginTop: 16 }}
            >
              <p>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                <strong>Địa chỉ:</strong> {company.address || "Chưa cập nhật"}
              </p>
              <p>
                <GlobalOutlined style={{ marginRight: 8 }} />
                <strong>Website:</strong> {company.website || "Chưa cập nhật"}
              </p>
              <p>
                <TeamOutlined style={{ marginRight: 8 }} />
                <strong>Quy mô:</strong> {company.size || "Chưa cập nhật"}
              </p>
              <p>
                <ClusterOutlined style={{ marginRight: 8 }} />
                <strong>Lĩnh vực:</strong> {company.industry || "Chưa cập nhật"}
              </p>
            </Card>

            <Card title="VIỆC LÀM CÙNG CÔNG TY">
              {otherJobs.length === 0 ? (
                <p>Chưa có thêm việc làm khác.</p>
              ) : (
                <ul className="company-jobs-card">
                  {otherJobs.map((oj, idx) => (
                    <li key={idx}>
                      <div className="job-title">
                        <a href="#" onClick={() => setSelectedJob(oj)}>
                          {oj.title}
                        </a>
                      </div>
                      <div className="job-meta-details">
                        <span>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {oj.deadline || "Chưa cập nhật"}
                        </span>
                        <span>
                          <MoneyCollectOutlined style={{ marginRight: 4 }} />
                          {oj.salary || "Thoả thuận"}
                        </span>
                        <span>
                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                          {oj.location || "Chưa cập nhật"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />
      <div className="modal-footer">
        <div className="footer-section">
          <h3>Thông tin liên hệ</h3>
          <p>
            <strong>Người liên hệ:</strong>{" "}
            {selectedJob.contact?.name || "Phòng Nhân Sự"}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {company.address || "Chưa cập nhật"}
          </p>
          <p>
            <strong>Số điện thoại:</strong>{" "}
            {selectedJob.contact?.phone || company.phone || "Chưa cập nhật"}
          </p>
        </div>

        <Divider />

        <div className="footer-section">
          <h3>Cách nộp hồ sơ</h3>
          <div className="step1">
            <span className="step-title">Bước 1:</span> Nộp hồ sơ qua email:
            <Button type="primary" style={{ marginLeft: 8 }}>
              Nộp hồ sơ
            </Button>
          </div>
          <p className="step-guide">
            Bấm vào nút <strong>“NỘP HỒ SƠ”</strong> để gửi hồ sơ đến nhà tuyển
            dụng
          </p>
        </div>

        <Divider />

        <div className="footer-section deadline-report">
          <div className="deadline">
            <strong>Hạn nộp:</strong>{" "}
            <span className="deadline-date">
              {selectedJob.deadline || "Chưa cập nhật"}
            </span>
          </div>
          <div className="report">
            <a href="#" className="report-link">
              Báo cáo
            </a>
          </div>
        </div>

        <Divider />

        <div className="footer-section1 related-jobs">
          <h3>XEM THÊM TIN LIÊN QUAN</h3>
          <ul>
            <li>
              <a href="#">Việc làm quản lý xây dựng</a>
            </li>
            <li>
              <a href="#">Tuyển dụng tại Cần Thơ</a>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default JobDetailModal;
