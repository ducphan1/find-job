// src/pages/employer/EmployerDashboard.js
import React from "react";
import { Typography } from "antd";
import EmployerLayout from "../../layout/EmployerLayout";
import "../../styles/EmployerDashboard.css";

const { Title, Paragraph } = Typography;

const EmployerDashboard = () => {
  return (
    <EmployerLayout>
      <div className="employer-dashboard">
        <div className="container">
          <Title level={2}>Trang Quản lý Nhà tuyển dụng</Title>
          <Paragraph>
            Đây là giao diện dành riêng cho nhà tuyển dụng, nơi bạn có thể đăng
            tin, quản lý đơn ứng tuyển và cập nhật thông tin công ty.
          </Paragraph>
          {/* Các chức năng của nhà tuyển dụng được tích hợp ở đây */}
        </div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerDashboard;
