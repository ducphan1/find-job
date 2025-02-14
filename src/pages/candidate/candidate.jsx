// src/pages/candidate/CandidateDashboard.js
import React from "react";
import { Typography } from "antd";
import CandidateLayout from "../../layout/CandidateLayout";
import "../../styles/CandidateDashboard.css";

const { Title, Paragraph } = Typography;

const CandidateDashboard = () => {
  return (
    <CandidateLayout>
      <div className="candidate-dashboard">
        <div className="container">
          <Title level={2}>Trang Quản lý Ứng viên</Title>
          <Paragraph>
            Đây là giao diện dành riêng cho ứng viên, nơi bạn có thể cập nhật hồ
            sơ, theo dõi đơn ứng tuyển và quản lý thông tin cá nhân.
          </Paragraph>
          {/* Các chức năng của ứng viên được tích hợp ở đây */}
        </div>
      </div>
    </CandidateLayout>
  );
};

export default CandidateDashboard;
