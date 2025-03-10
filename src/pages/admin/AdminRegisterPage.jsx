import React, { useEffect, useRef } from "react";
import { Form, Input, Button, message } from "antd";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminRegisterPage = () => {
  const shapeRefs = useRef([]);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Hiệu ứng animation cho background
  useEffect(() => {
    shapeRefs.current.forEach((shapeEl, index) => {
      if (shapeEl) {
        gsap.to(shapeEl, {
          x: "random(-50, 50)",
          y: "random(-50, 50)",
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: index * 0.2,
        });
      }
    });
  }, []);

  // Xử lý khi submit form
  const onFinish = async (values) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        ...values,
        role: "admin", // Gán vai trò admin
      });
      message.success("Đăng ký admin thành công!");
      navigate("/admin/login"); // Chuyển hướng sau khi đăng ký thành công
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      message.error(
        error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!"
      );
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form failed:", errorInfo);
  };

  return (
    <div
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
    >
      {/* Background animation */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#b3ecff",
          zIndex: 0,
        }}
      >
        {Array(20)
          .fill(0)
          .map((_, i) => {
            const size = Math.random() * 50 + 20;
            return (
              <div
                key={i}
                ref={(el) => (shapeRefs.current[i] = el)}
                style={{
                  position: "absolute",
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  borderRadius: "50%",
                  background: i % 2 === 0 ? "#fff" : "#ccffff",
                  opacity: 0.7,
                }}
              />
            );
          })}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            paddingTop: "30px",
            marginBottom: "40px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "500px",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: 30 }}>
              ĐĂNG KÝ TÀI KHOẢN ADMIN
            </h2>

            <Form
              name="adminRegisterForm"
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="Tên"
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
              >
                <Input placeholder="Nhập tên" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  ĐĂNG KÝ ADMIN
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
