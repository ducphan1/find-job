import React from "react";
import { Typography } from "antd";
import AdminLayout from "../../layout/AdminLayout";
import "../../styles/AdminDashboard.css";

const { Title, Paragraph } = Typography;

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="container">
          <Title level={2}>Trang Quản trị Admin</Title>
          <Paragraph>
            Đây là giao diện dành riêng cho Admin, nơi bạn có thể quản lý người
            dùng, tin tuyển dụng, báo cáo và các thiết lập hệ thống.
          </Paragraph>
          {/* Các chức năng quản trị được tích hợp ở đây */}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
