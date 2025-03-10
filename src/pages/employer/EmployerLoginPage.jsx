import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../layout/PublicLayout.js";
import axios from "axios";
import { io } from "socket.io-client";

// Cấu hình toast
message.config({
  top: 80,
  duration: 3,
});

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const EmployerLoginPage = () => {
  const shapeRefs = useRef([]);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [socket, setSocket] = useState(null);

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
    message.info("Test message from EmployerLoginPage!");
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

  // Thiết lập Socket.IO sau khi đăng nhập thành công
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("notification", (notification) => {
      message.info(`Thông báo: ${notification.message}`);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Submit form
  const onFinish = async (values) => {
    setErrorMessage("");

    try {
      const { email, password } = values;
      const response = await axios.post(
        "http://localhost:3000/api/auth/login", // Sửa URL thành đúng endpoint backend
        { email, password }
      );
      console.log("Login response:", response.data);

      const { token, user } = response.data;

      if (user && user.role === "employer") {
        localStorage.setItem("token", token);
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        message.success(
          `Đăng nhập thành công. Chào ${user.name || user.email}!`
        );

        if (socket) {
          socket.emit("register", user._id);
          console.log(`Registered user ${user._id} with socket`);
        }

        navigate("/employer/dashboard");
      } else {
        message.error("Trang này chỉ dành cho nhà tuyển dụng!");
        setErrorMessage("Trang này chỉ dành cho nhà tuyển dụng!");
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
                ĐĂNG NHẬP TÀI KHOẢN NHÀ TUYỂN DỤNG
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
                    name="employerLoginForm"
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
                      <p style={{ marginTop: 10, textAlign: "center" }}>
                        <a
                          onClick={() => navigate("/user/forgot-password")}
                          style={{ cursor: "pointer", color: "#1890ff" }}
                        >
                          Quên mật khẩu?
                        </a>
                      </p>
                    </Form.Item>
                  </Form>
                </div>

                {/* Cột phải: Thông tin / tiện ích */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 15 }}>Đăng nhập Nhà tuyển dụng</h3>
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
                      Quản lý tin tuyển dụng
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Tương tác với hàng triệu ứng viên
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Thương hiệu nhà tuyển dụng
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Quảng cáo hiệu quả
                    </li>
                  </ul>
                  <p style={{ lineHeight: 1.6 }}>
                    Nếu bạn chưa có tài khoản, vui lòng{" "}
                    <a
                      onClick={() => navigate("/employer/register")}
                      style={{ cursor: "pointer", color: "#1890ff" }}
                    >
                      Đăng ký
                    </a>{" "}
                    để trải nghiệm dịch vụ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default EmployerLoginPage;
