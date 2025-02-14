import React from "react";
import { Row, Col, Typography, Button } from "antd";
import {
  MailOutlined,
  UserOutlined,
  LoginOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import "../styles/Topbar.css";

const { Text } = Typography;

const Topbar = () => {
  return (
    <div className="topbar">
      <Row justify="space-around" align="middle">
        <Col>
          <Text className="topbar-item">
            <SolutionOutlined className="icon" /> Đăng tuyển: 0916926439
          </Text>
          <Text className="topbar-item">Tìm việc: 0916926436</Text>
          <Text className="topbar-item">Phone: 0916926436</Text>
          <Text className="topbar-item">
            <MailOutlined className="icon" /> duc12a111@gmail.com
          </Text>
        </Col>

        <Col>
          <Text className="topbar-item">
            <LoginOutlined className="icon" /> <a href="/login">Đăng nhập</a> |{" "}
            <UserOutlined className="icon" /> <a href="/signup">Đăng ký</a>
          </Text>
          <Button className="recruiter-btn">Dành cho nhà tuyển dụng</Button>
        </Col>
      </Row>
    </div>
  );
};

export default Topbar;
