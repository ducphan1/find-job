import React, { useState } from "react";
import axios from "axios";
import { Form, Input, Button, Divider, Row, Col, message, Tag } from "antd";
import {
  GoogleOutlined,
  FacebookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

// Cấu hình thông báo Ant Design
message.config({ top: 100, duration: 3 });

const SecurityPage = () => {
  const [form] = Form.useForm();

  // Giả lập trạng thái liên kết Google / Facebook
  const [linkedGoogle, setLinkedGoogle] = useState(false);
  const [linkedFacebook, setLinkedFacebook] = useState(false);

  // Trạng thái để hiển thị thông báo trực tiếp trên UI
  const [notification, setNotification] = useState({
    type: "", // "success" hoặc "error"
    message: "",
    visible: false,
  });

  // Hiển thị thông báo trên UI
  const showNotification = (type, msg) => {
    setNotification({ type, message: msg, visible: true });
    // Ẩn thông báo sau 3 giây
    setTimeout(
      () => setNotification({ ...notification, visible: false }),
      3000
    );
  };

  // Xử lý liên kết / hủy liên kết Google
  const handleLinkGoogle = () => {
    if (!linkedGoogle) {
      // Gọi API liên kết Google...
      setLinkedGoogle(true);
      message.success("Đã liên kết với Google!");
    } else {
      // Gọi API hủy liên kết...
      setLinkedGoogle(false);
      message.info("Đã hủy liên kết Google.");
    }
  };

  // Xử lý liên kết / hủy liên kết Facebook
  const handleLinkFacebook = () => {
    if (!linkedFacebook) {
      // Gọi API liên kết Facebook...
      setLinkedFacebook(true);
      message.success("Đã liên kết với Facebook!");
    } else {
      // Gọi API hủy liên kết...
      setLinkedFacebook(false);
      message.info("Đã hủy liên kết Facebook.");
    }
  };

  // Xử lý khi nhấn "Đổi mật khẩu"
  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      if (!token) {
        message.warning("Bạn chưa đăng nhập!");
        showNotification("error", "Bạn chưa đăng nhập!");
        return;
      }

      console.log("Form values:", values); // Log dữ liệu từ form

      // Chỉ gửi oldPassword và newPassword
      const payload = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      };

      console.log("Payload gửi đi:", payload); // Log dữ liệu gửi đi

      // Gửi request đến backend
      const response = await axios.post(
        "http://localhost:5000/api/user/change-password",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Response từ backend:", response.data); // Log phản hồi thành công
      message.success("Đổi mật khẩu thành công!");
      showNotification("success", "Đổi mật khẩu thành công!");
      form.resetFields();
    } catch (error) {
      console.error("Error changing password:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu!";

      // Log chi tiết lỗi
      console.log("Error details:", error.response?.data);

      // Kiểm tra nếu lỗi là do mật khẩu cũ không chính xác
      if (errorMessage.toLowerCase().includes("mật khẩu cũ không chính xác")) {
        message.error("Sai mật khẩu cũ!");
        showNotification("error", "Sai mật khẩu cũ!");
      } else {
        message.error(errorMessage);
        showNotification("error", errorMessage);
      }
    }
  };

  // Ẩn thông báo thủ công (nếu cần)
  const handleCloseNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        minHeight: "80vh",
        position: "relative", // Để thông báo có thể hiển thị tuyệt đối trên component
      }}
    >
      {/* Hiển thị thông báo trực tiếp trên UI */}
      {notification.visible && (
        <div
          style={{
            position: "fixed",
            top: 100,
            right: 20,
            background: notification.type === "success" ? "#d4edda" : "#f8d7da",
            color: notification.type === "success" ? "#155724" : "#721c24",
            padding: "10px 20px",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 300,
          }}
        >
          <span>{notification.message}</span>
          <Button
            type="link"
            size="small"
            onClick={handleCloseNotification}
            style={{ color: "inherit", padding: 0, marginLeft: 10 }}
          >
            Đóng
          </Button>
        </div>
      )}

      <h2 style={{ fontSize: 20, marginBottom: 20 }}>Tài khoản và bảo mật</h2>

      {/* ========== PHẦN LIÊN KẾT MẠNG XÃ HỘI ========== */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 10, fontSize: 16 }}>
          Liên kết với các mạng xã hội
        </h3>
        <p style={{ marginBottom: 20, color: "#666" }}>
          Sử dụng tài khoản Google hoặc Facebook để đăng nhập nhanh và bảo mật
          tốt hơn.
        </p>

        {/* Google */}
        <Row
          style={{
            padding: "10px 0",
            borderBottom: "1px solid #f0f0f0",
            marginBottom: 10,
          }}
          align="middle"
        >
          <Col xs={24} sm={12}>
            <GoogleOutlined style={{ fontSize: 18, color: "#db4437" }} />
            <span style={{ marginLeft: 8, fontSize: 15 }}>
              Tài khoản Google
            </span>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            {linkedGoogle ? (
              <>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Đã liên kết
                </Tag>
                <Button type="default" onClick={handleLinkGoogle}>
                  Hủy liên kết
                </Button>
              </>
            ) : (
              <>
                <Tag icon={<CloseCircleOutlined />} color="default">
                  Chưa liên kết
                </Tag>
                <Button
                  type="primary"
                  icon={<GoogleOutlined />}
                  style={{
                    backgroundColor: "#db4437",
                    borderColor: "#db4437",
                  }}
                  onClick={handleLinkGoogle}
                >
                  Liên kết
                </Button>
              </>
            )}
          </Col>
        </Row>

        {/* Facebook */}
        <Row
          style={{
            padding: "10px 0",
            borderBottom: "1px solid #f0f0f0",
          }}
          align="middle"
        >
          <Col xs={24} sm={12}>
            <FacebookOutlined style={{ fontSize: 18, color: "#3b5998" }} />
            <span style={{ marginLeft: 8, fontSize: 15 }}>
              Tài khoản Facebook
            </span>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: "right" }}>
            {linkedFacebook ? (
              <>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Đã liên kết
                </Tag>
                <Button type="default" onClick={handleLinkFacebook}>
                  Hủy liên kết
                </Button>
              </>
            ) : (
              <>
                <Tag icon={<CloseCircleOutlined />} color="default">
                  Chưa liên kết
                </Tag>
                <Button
                  type="primary"
                  icon={<FacebookOutlined />}
                  style={{
                    backgroundColor: "#3b5998",
                    borderColor: "#3b5998",
                  }}
                  onClick={handleLinkFacebook}
                >
                  Liên kết
                </Button>
              </>
            )}
          </Col>
        </Row>
      </div>

      <Divider />

      {/* ========== PHẦN TẠO MẬT KHẨU MỚI ========== */}
      <div>
        <h3 style={{ marginBottom: 10, fontSize: 16 }}>Tạo mật khẩu mới</h3>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Mật khẩu cũ"
                name="oldPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu cũ" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Nhập lại mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập lại mật khẩu mới!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SecurityPage;
