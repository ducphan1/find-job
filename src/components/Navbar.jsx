import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "../styles/Navbar.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  return (
    <div className="navbar-container">
      <div className="logo">
        <a href="/">
          <img src={logo} alt="Logo" />
        </a>
      </div>

      <Menu mode="horizontal" className="navbar">
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <a href="/">Trang chủ</a>
        </Menu.Item>
        <Menu.Item key="search" icon={<SearchOutlined />}>
          <a href="/job-search">Tìm việc</a>
        </Menu.Item>
        <Menu.Item key="employer" icon={<TeamOutlined />}>
          <a href="/employer">Nhà tuyển dụng</a>
        </Menu.Item>
        <Menu.Item key="candidate" icon={<UserOutlined />}>
          <a href="/candidate">Ứng viên</a>
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Navbar;
