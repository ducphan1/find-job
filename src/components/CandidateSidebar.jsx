import React from "react";
import { Menu } from "antd";
import { UserOutlined, ProfileOutlined } from "@ant-design/icons";
import "../styles/CandidateSidebar.css";

const CandidateSidebar = () => {
  return (
    <div className="candidate-sidebar">
      <Menu mode="inline" theme="dark">
        <Menu.Item key="dashboard" icon={<UserOutlined />}>
          <a href="/candidate/dashboard">Dashboard</a>
        </Menu.Item>
        <Menu.Item key="applications" icon={<ProfileOutlined />}>
          <a href="/candidate/applications">Đơn ứng tuyển</a>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default CandidateSidebar;
