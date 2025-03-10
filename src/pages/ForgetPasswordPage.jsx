import React from "react";
import { Form, Input, Button } from "antd";
import PublicLayout from "../layout/PublicLayout";
import "../styles/ForgetPasswordPage.css";

const ForgetPasswordPage = () => {
  const onFinish = (values) => {
    console.log("Forget password values: ", values);
  };

  return (
    <PublicLayout>
      <div className="forget-password-page">
        <div className="container">
          <h2>Quên mật khẩu</h2>
          <Form
            name="forget_password_form"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input placeholder="Nhập email của bạn" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Gửi yêu cầu đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ForgetPasswordPage;
