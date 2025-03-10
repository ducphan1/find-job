import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Button, message, Steps } from "antd";
import {
  CheckOutlined,
  MailOutlined,
  LockOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PublicLayout from "../layout/PublicLayout.js";
import "../styles/UserRegisterPage.css";

message.config({
  top: 80,
  duration: 3,
});

const { Step } = Steps;

const ForgotPasswordPage = () => {
  const shapeRefs = useRef([]);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    const jobSearchEl = document.querySelector(".job-search-container");
    if (jobSearchEl) jobSearchEl.style.display = "none";
    return () => {
      if (jobSearchEl) jobSearchEl.style.display = "";
    };
  }, []);

  useEffect(() => {
    message.info("Bạn đang ở trang Quên mật khẩu!");
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

  const handleSendCode = async (values) => {
    setLoading(true);
    setErrorMessage("");
    try {
      console.log("Sending reset code request with:", values);
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email: values.email }
      );
      console.log("Response from forgot-password API:", response.data);
      message.success("Mã xác thực đã được gửi đến email của bạn!");
      setEmail(values.email);
      setStep(1);
      form.resetFields();
    } catch (error) {
      console.error("Full error details:", error);
      const errMsg =
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!";
      message.error(errMsg);
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    setLoading(true);
    setErrorMessage("");
    try {
      console.log("Resetting password with:", {
        email,
        code: values.code,
        newPassword: values.newPassword,
      });
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          email,
          code: values.code,
          newPassword: values.newPassword,
        }
      );
      console.log("Response from reset-password API:", response.data);
      message.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate("/user/login");
      form.resetFields();
    } catch (error) {
      console.error("Full error details:", error);
      const errMsg =
        error.response?.data?.message ||
        "Mã xác thực không đúng hoặc đã hết hạn!";
      message.error(errMsg);
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
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
                QUÊN MẬT KHẨU
              </h2>

              <Steps current={step} style={{ marginBottom: 20 }}>
                <Step title="Nhập email" />
                <Step title="Xác thực và đặt lại" />
              </Steps>

              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  {errorMessage && (
                    <p style={{ color: "red", marginBottom: 10 }}>
                      {errorMessage}
                    </p>
                  )}

                  {step === 0 ? (
                    <Form
                      form={form}
                      name="forgotPasswordForm"
                      layout="vertical"
                      onFinish={handleSendCode}
                      onFinishFailed={onFinishFailed}
                      initialValues={{ email: "" }}
                    >
                      <Form.Item
                        label="Email đăng nhập (*)"
                        name="email"
                        rules={[
                          { required: true, message: "Vui lòng nhập email!" },
                          { type: "email", message: "Email không hợp lệ!" },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined />}
                          placeholder="Nhập email đã đăng ký"
                        />
                      </Form.Item>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          block
                          style={{ width: "100%" }}
                        >
                          GỬI MÃ XÁC THỰC
                        </Button>
                      </Form.Item>
                    </Form>
                  ) : (
                    <div>
                      <p style={{ marginBottom: 20 }}>
                        Mã xác thực đã được gửi đến: <strong>{email}</strong>.
                        Vui lòng kiểm tra hộp thư đến hoặc thư rác.
                      </p>
                      <Form
                        form={form}
                        name="resetPasswordForm"
                        layout="vertical"
                        onFinish={handleResetPassword}
                        onFinishFailed={onFinishFailed}
                        initialValues={{
                          code: "",
                          newPassword: "",
                          confirmPassword: "",
                        }}
                      >
                        <Form.Item
                          label="Mã xác thực (*)"
                          name="code"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mã xác thực!",
                            },
                            {
                              len: 6,
                              message: "Mã xác thực phải có 6 ký tự!",
                            },
                          ]}
                        >
                          <Input
                            prefix={<CodeOutlined />}
                            placeholder="Nhập mã 6 chữ số"
                          />
                        </Form.Item>

                        <Form.Item
                          label="Mật khẩu mới (*)"
                          name="newPassword"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mật khẩu mới!",
                            },
                            {
                              min: 6,
                              message: "Mật khẩu ít nhất 6 ký tự!",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu mới"
                          />
                        </Form.Item>

                        <Form.Item
                          label="Xác nhận mật khẩu (*)"
                          name="confirmPassword"
                          dependencies={["newPassword"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng xác nhận mật khẩu!",
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (
                                  !value ||
                                  getFieldValue("newPassword") === value
                                ) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  new Error("Mật khẩu không khớp!")
                                );
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Xác nhận mật khẩu"
                          />
                        </Form.Item>

                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{ width: "100%" }}
                          >
                            ĐẶT LẠI MẬT KHẨU
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 15 }}>Quên mật khẩu</h3>
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
                      Nhập email để nhận mã xác thực
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "blue" }}
                      />{" "}
                      Xác thực nhanh chóng qua email
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "blue" }}
                      />{" "}
                      Đặt lại mật khẩu an toàn
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "blue" }}
                      />{" "}
                      Hỗ trợ kỹ thuật 24/7
                    </li>
                  </ul>
                  <p style={{ lineHeight: 1.6 }}>
                    Quay lại{" "}
                    <a
                      onClick={() => navigate("/user/login")}
                      style={{ cursor: "pointer", color: "#1890ff" }}
                    >
                      Đăng nhập
                    </a>{" "}
                    hoặc{" "}
                    <a
                      onClick={() => navigate("/user/register")}
                      style={{ cursor: "pointer", color: "#1890ff" }}
                    >
                      Đăng ký
                    </a>{" "}
                    nếu bạn chưa có tài khoản.
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

export default ForgotPasswordPage;
