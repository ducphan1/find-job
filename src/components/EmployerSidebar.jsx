import React from "react";
import { Menu } from "antd";
import { ShopOutlined, FileOutlined } from "@ant-design/icons";
import "../styles/EmployerSidebar.css";

const EmployerSidebar = () => {
  return (
    <div className="employer-sidebar">
      <Menu mode="inline" theme="dark">
        <Menu.Item key="dashboard" icon={<ShopOutlined />}>
          <a href="/employer/dashboard">Dashboard</a>
        </Menu.Item>
        <Menu.Item key="jobs" icon={<FileOutlined />}>
          <a href="/employer/jobs">Quản lý tin tuyển dụng</a>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default EmployerSidebar;
