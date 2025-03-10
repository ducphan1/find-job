import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../actions/authActions";
import PublicLayout from "../../layout/PublicLayout.js";
import "../../styles/UserRegisterPage.css";

message.config({
  top: 80,
  duration: 3,
});

const UserLoginPage = () => {
  const shapeRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const jobSearchEl = document.querySelector(".job-search-container");
    if (jobSearchEl) jobSearchEl.style.display = "none";
    return () => {
      if (jobSearchEl) jobSearchEl.style.display = "";
    };
  }, []);

  useEffect(() => {
    message.info("Bạn đang ở trang Đăng nhập Ứng viên!");
  }, []);

  useEffect(() => {
    const animations = shapeRefs.current.map((shapeEl, index) =>
      shapeEl
        ? gsap.to(shapeEl, {
            x: "random(-50, 50)",
            y: "random(-50, 50)",
            duration: 4,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: index * 0.2,
          })
        : null
    );
    return () => animations.forEach((anim) => anim?.kill());
  }, []);

  const onFinish = async (values) => {
    setErrorMessage("");
    try {
      const { email, password } = values;
      console.log("UserLoginPage - Attempting login with:", {
        email,
        password,
      });
      await dispatch(login(email, password));
      console.log("UserLoginPage - Login successful");
      message.success("Đăng nhập thành công!");
      navigate("/user/dashboard");
    } catch (error) {
      const errMsg = error.message || "Đã xảy ra lỗi, vui lòng thử lại!";
      console.error("UserLoginPage - Login failed:", errMsg);
      message.error(errMsg);
      setErrorMessage(errMsg);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("UserLoginPage - Form failed:", errorInfo);
  };

  return (
    <PublicLayout>
      <div
        style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
      >
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
                width: "900px",
                padding: "30px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <h2 style={{ textAlign: "center", marginBottom: 30 }}>
                ĐĂNG NHẬP TÀI KHOẢN NGƯỜI TÌM VIỆC
              </h2>

              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  {errorMessage && (
                    <p style={{ color: "red", marginBottom: 10 }}>
                      {errorMessage}
                    </p>
                  )}
                  <Form
                    name="userLoginForm"
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

                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 15 }}>Đăng nhập Người tìm việc</h3>
                  <ul
                    style={{
                      listStyle: "none",
                      paddingLeft: 0,
                      marginBottom: 15,
                    }}
                  >
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "blue" }}
                      />{" "}
                      Cập nhật công việc mới liên tục
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "blue" }}
                      />{" "}
                      Hoàn toàn miễn phí
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "blue" }}
                      />{" "}
                      Tìm kiếm việc làm phù hợp nhanh chóng
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "blue" }}
                      />{" "}
                      Hỗ trợ hồ sơ cá nhân chuyên nghiệp
                    </li>
                  </ul>
                  <p style={{ lineHeight: 1.6 }}>
                    Nếu bạn chưa có tài khoản, vui lòng{" "}
                    <a
                      onClick={() => navigate("/user/register")}
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

export default UserLoginPage;
