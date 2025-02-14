import React from "react";
import { Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FileOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import "../styles/AdminSidebar.css";

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <Menu mode="inline" theme="dark">
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <a href="/admin/dashboard">Dashboard</a>
        </Menu.Item>
        <Menu.Item key="users" icon={<UserOutlined />}>
          <a href="/admin/users">Quản lý người dùng</a>
        </Menu.Item>
        <Menu.Item key="jobs" icon={<FileOutlined />}>
          <a href="/admin/jobs">Quản lý tin tuyển dụng</a>
        </Menu.Item>
        <Menu.Item key="reports" icon={<BarChartOutlined />}>
          <a href="/admin/reports">Báo cáo</a>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default AdminSidebar;
