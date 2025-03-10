import React, { useEffect, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  DatePicker,
  Radio,
  message,
  Upload,
} from "antd";
import { CheckOutlined, UploadOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import "../../styles/UserRegisterPage.css";
import PublicLayout from "../../layout/PublicLayout.js";
import axios from "axios";

// Hàm chuyển đổi event onChange của Upload thành fileList cho Form
const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const UserRegisterPage = () => {
  const shapeRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Hiệu ứng GSAP cho các hình tròn
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

  const onFinish = async (values) => {
    console.log("Form values:", values);

    // Dùng FormData để gửi cả file và text
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("confirmPassword", values.confirmPassword);
    formData.append("role", "user");
    formData.append("name", values.fullName || "Người tìm việc");
    formData.append("phone", values.phoneNumber || ""); // Đổi thành phone
    formData.append("dob", values.dob ? values.dob.format("DD/MM/YYYY") : "");
    formData.append("gender", values.gender || "");
    formData.append("address", values.address || "");

    // Thêm file avatar nếu có
    if (values.avatar && values.avatar.length > 0) {
      const fileObj = values.avatar[0].originFileObj;
      if (fileObj && fileObj.size > 0) {
        formData.append("avatar", fileObj);
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      message.success("Đăng ký ứng viên thành công!");
      navigate("/user/login");
    } catch (error) {
      if (error.response && error.response.data) {
        console.error("Registration error:", error.response.data);
        message.error(error.response.data.message || "Đăng ký thất bại!");
      } else {
        console.error("Registration error:", error);
        message.error("Đăng ký thất bại do lỗi kết nối!");
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form failed:", errorInfo);
  };

  return (
    <PublicLayout>
      <div className="register-page-container">
        {/* Nền động */}
        <div className="background-animation">
          {Array(20)
            .fill(0)
            .map((_, i) => {
              const size = Math.random() * 50 + 20;
              return (
                <div
                  key={i}
                  ref={(el) => (shapeRefs.current[i] = el)}
                  className="floating-shape"
                  style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: i % 2 === 0 ? "#fff" : "#ccffff",
                  }}
                />
              );
            })}
        </div>

        <div className="register-container">
          {/* Cột trái: Form đăng ký */}
          <div className="register-left">
            <h2 className="register-title">Thông Tin Đăng Ký Tài Khoản</h2>
            <p className="already-text">
              Nếu đã có tài khoản, xin vui lòng{" "}
              <a href="/user/login">Đăng nhập tại đây</a>
            </p>

            <Form
              name="candidateRegisterForm"
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              {/* Email */}
              <Form.Item
                label="Email đăng nhập (*)"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Vui lòng nhập email hợp lệ!",
                  },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>

              {/* Mật khẩu */}
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

              {/* Xác nhận mật khẩu */}
              <Form.Item
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Mật khẩu không khớp!");
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu" />
              </Form.Item>

              {/* Họ tên */}
              <Form.Item label="Họ tên" name="fullName">
                <Input placeholder="Nhập họ tên" />
              </Form.Item>

              {/* Ngày sinh */}
              <Form.Item label="Ngày sinh" name="dob">
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>

              {/* Giới tính */}
              <Form.Item label="Giới tính" name="gender">
                <Radio.Group>
                  <Radio value="male">Nam</Radio>
                  <Radio value="female">Nữ</Radio>
                </Radio.Group>
              </Form.Item>

              {/* Số điện thoại */}
              <Form.Item label="Số điện thoại" name="phoneNumber">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              {/* Địa chỉ */}
              <Form.Item label="Địa chỉ" name="address">
                <Input placeholder="Nhập địa chỉ" />
              </Form.Item>

              {/* Ảnh đại diện */}
              <Form.Item
                label="Ảnh đại diện"
                name="avatar"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload
                  name="avatar"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  accept="image/*"
                  showUploadList={true}
                >
                  <Button icon={<UploadOutlined />}>Chọn Ảnh Đại Diện</Button>
                </Upload>
              </Form.Item>

              {/* Đồng ý điều khoản */}
              <Form.Item
                name="agreeTerms"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject("Bạn cần đồng ý với điều khoản!"),
                  },
                ]}
              >
                <Checkbox>
                  Đồng ý với các <a href="#">quy định của chúng tôi</a>
                </Checkbox>
              </Form.Item>

              {/* Nút đăng ký */}
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  ĐĂNG KÝ ỨNG VIÊN
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Cột phải: Đăng ký mạng xã hội + Lợi ích */}
          <div className="register-right">
            <h3 className="register-social-title">
              Đăng Ký Bằng Tài Khoản Xã Hội
            </h3>
            <div className="social-buttons">
              <Button className="facebook-btn">
                <FontAwesomeIcon icon={faFacebook} />
                Đăng Ký Bằng Facebook
              </Button>
              <Button className="google-btn">
                <FontAwesomeIcon icon={faGoogle} />
                Đăng Ký Bằng Google
              </Button>
            </div>
            <ul className="register-benefits">
              <li>
                <CheckOutlined style={{ marginRight: 5, color: "orange" }} />
                +1.500.000 công việc được cập nhật thường xuyên
              </li>
              <li>
                <CheckOutlined style={{ marginRight: 5, color: "orange" }} />
                Ứng tuyển công việc yêu thích HOÀN TOÀN MIỄN PHÍ
              </li>
              <li>
                <CheckOutlined style={{ marginRight: 5, color: "orange" }} />
                Hiển thị thông tin hồ sơ với nhà tuyển dụng hàng đầu
              </li>
              <li>
                <CheckOutlined style={{ marginRight: 5, color: "orange" }} />
                Nhận bản tin ưu tiên công việc phù hợp
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default UserRegisterPage;
