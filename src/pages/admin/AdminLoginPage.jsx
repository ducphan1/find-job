import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../layout/PublicLayout.js";
import axios from "axios";

// Cấu hình toast
message.config({
  top: 80,
  duration: 3,
});

const AdminLoginPage = () => {
  const shapeRefs = useRef([]);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Ẩn .job-search-container nếu có
  useEffect(() => {
    const jobSearchEl = document.querySelector(".job-search-container");
    if (jobSearchEl) {
      jobSearchEl.style.display = "none";
    }
    return () => {
      if (jobSearchEl) {
        jobSearchEl.style.display = "";
      }
    };
  }, []);

  // Test message khi mount
  useEffect(() => {
    message.info("Test message from AdminLoginPage!");
  }, []);

  // Hiệu ứng GSAP cho background
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

  // Submit form
  const onFinish = async (values) => {
    setErrorMessage(""); // Clear lỗi cũ

    try {
      const { email, password } = values;
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      console.log("Login response:", response.data); // Debug dữ liệu trả về

      const { token, user } = response.data;

      // Chỉ cho phép admin đăng nhập từ trang này
      if (user && user.role === "admin") {
        localStorage.setItem("token", token);
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        message.success(
          `Đăng nhập thành công. Chào ${user.name || user.email}!`
        );
        navigate("/admin/dashboard"); // Chuyển hướng đến dashboard admin
      } else {
        // Nếu không phải admin, báo lỗi và không lưu token
        message.error("Trang này chỉ dành cho admin!");
        setErrorMessage("Trang này chỉ dành cho admin!");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      const errMsg =
        error.response?.data?.message || "Email hoặc mật khẩu không đúng!";
      message.error(errMsg);
      setErrorMessage(errMsg);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form failed:", errorInfo);
  };

  return (
    <PublicLayout>
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

        {/* Nội dung chính */}
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
                width: "900px",
                padding: "30px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <h2 style={{ textAlign: "center", marginBottom: 30 }}>
                ĐĂNG NHẬP TÀI KHOẢN ADMIN
              </h2>

              <div style={{ display: "flex", gap: "20px" }}>
                {/* Cột trái: Form đăng nhập */}
                <div style={{ flex: 1 }}>
                  {errorMessage && (
                    <p style={{ color: "red", marginBottom: 10 }}>
                      {errorMessage}
                    </p>
                  )}
                  <Form
                    name="adminLoginForm"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                  >
                    <Form.Item
                      label="Email đăng nhập (*)"
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                      ]}
                    >
                      <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item
                      label="Mật khẩu (*)"
                      name="password"
                      rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu!" },
                        { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" },
                      ]}
                    >
                      <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" block>
                        ĐĂNG NHẬP
                      </Button>
                    </Form.Item>
                  </Form>
                </div>

                {/* Cột phải: Thông tin / tiện ích */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 15 }}>Đăng nhập Admin</h3>
                  <ul
                    style={{
                      listStyle: "none",
                      paddingLeft: 0,
                      marginBottom: 15,
                    }}
                  >
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Quản lý người dùng
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Quản lý nhà tuyển dụng
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Quản lý tin tuyển dụng
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Chỉnh sửa slide và cài đặt hệ thống
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AdminLoginPage;
