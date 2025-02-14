import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Card, Button } from "antd";
import PublicLayout from "../layout/PublicLayout";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  UserOutlined,
  GlobalOutlined,
  MessageOutlined,
  PlusOutlined,
  SendOutlined,
  MoneyCollectOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import "../styles/CompanyDetailPage.css";

import bannerDefault from "../assets/bannerDefault.jpg";
import logoMinhdang from "../assets/logominhdang.png";

import { companies } from "../data/bestcompanies";
import JobDetailModal from "../components/JobDetailModal";

const CompanyDetailPage = () => {
  const { id } = useParams();
  const company = companies.find((c) => c.id === id);

  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showJobDetail = (job) => {
    setSelectedJob(job);
    setIsModalVisible(true);
  };

  const hideJobDetail = () => {
    setSelectedJob(null);
    setIsModalVisible(false);
  };

  if (!company) {
    return <h2 className="not-found">Không tìm thấy công ty!</h2>;
  }

  const bannerToShow = company.banner || bannerDefault;
  const logoToShow = company.logo || logoMinhdang;

  return (
    <PublicLayout>
      <div className="company-detail-container">
        <div
          className="company-banner"
          style={{ backgroundImage: `url(${bannerToShow})` }}
        >
          <img src={logoToShow} alt={company.name} className="company-logo" />
        </div>

        <div className="company-info-container">
          <div className="company-info">
            <h2 className="company-name">{company.name}</h2>
            <p className="company-meta">
              {company.followers || 0} lượt theo dõi ·{" "}
              <span className="job-count">
                {company.jobs.length} tin tuyển dụng
              </span>
            </p>

            <div className="company-actions">
              <button>
                <PlusOutlined /> Theo dõi
              </button>
              <button>
                <MessageOutlined /> Nhắn tin
              </button>
              <div className="share-section">
                Chia sẻ:
                <a href="#" className="share-icon">
                  <FontAwesomeIcon icon={faFacebook} />
                </a>
                <a href="#" className="share-icon">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
              </div>
            </div>
          </div>

          <Card className="company-details" title="THÔNG TIN CÔNG TY">
            <p>
              <PhoneOutlined /> {company.phone}
            </p>
            <p>
              <EnvironmentOutlined /> {company.address}
            </p>
            <p>
              <GlobalOutlined /> {company.website || "Chưa cập nhật"}
            </p>
            <p>
              <UserOutlined /> Quy mô: {company.size}
            </p>
            <p>
              <FileSearchOutlined /> MST: {company.taxId}
            </p>
            <p>
              <FileTextOutlined /> {company.type}
            </p>
            <p>
              <FileTextOutlined /> Lĩnh vực: {company.industry}
            </p>
          </Card>
        </div>

        <Card className="job-list" title="Việc làm đang tuyển dụng">
          {company.jobs.map((job, index) => (
            <Row key={index} className="job-item" align="middle">
              <Col xs={24} sm={18}>
                <div
                  className="job-title"
                  style={{ cursor: "pointer", color: "#0073b1" }}
                  onClick={() => showJobDetail(job)}
                >
                  {job.title}
                </div>
                <div className="job-meta">
                  <MoneyCollectOutlined className="job-icon" />
                  <span>{job.salary || "Thoả thuận"}</span>
                  <span className="separator">|</span>

                  <CalendarOutlined className="job-icon" />
                  <span>{job.deadline}</span>
                  <span className="separator">|</span>

                  <EnvironmentOutlined className="job-icon" />
                  <span>{job.location}</span>
                </div>
              </Col>
              <Col xs={24} sm={6} className="job-actions">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  className="apply-btn"
                >
                  Ứng tuyển ngay
                </Button>
              </Col>
            </Row>
          ))}
        </Card>

        <Card className="company-intro" title="Giới thiệu công ty">
          <p>{company.intro}</p>
        </Card>
      </div>

      <JobDetailModal
        visible={isModalVisible}
        onCancel={hideJobDetail}
        job={selectedJob}
        company={company}
      />
    </PublicLayout>
  );
};

export default CompanyDetailPage;
