import React from "react";
import { Layout } from "antd";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminLayout.css";

const { Content } = Layout;

const AdminLayout = ({ children }) => {
  return (
    <Layout className="admin-layout">
      <AdminSidebar />
      <Layout>
        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
