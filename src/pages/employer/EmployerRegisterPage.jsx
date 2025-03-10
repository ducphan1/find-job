import React, { useEffect, useRef } from "react";
import { Form, Input, Button, Checkbox, Upload, message, Select } from "antd";
import { CheckOutlined, UploadOutlined } from "@ant-design/icons";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import "../../styles/EmployerRegisterPage.css";
import PublicLayout from "../../layout/PublicLayout";
import axios from "axios";
import { io } from "socket.io-client"; // Thêm import Socket.IO

const { Option } = Select;

// Hàm chuyển đổi sự kiện onChange của Upload thành fileList để Form nắm được
const normFile = (e) => {
  console.log("Upload event:", e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const EmployerRegisterPage = () => {
  const shapeRefs = useRef([]);
  const navigate = useNavigate();
  const [socket, setSocket] = React.useState(null); // State để quản lý Socket.IO

  useEffect(() => {
    // Hiệu ứng GSAP cho background
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

    // Khởi tạo Socket.IO
    const newSocket = io(SOCKET_URL, {
      reconnection: true, // Tự động kết nối lại nếu mất kết nối
    });
    setSocket(newSocket);

    // Lắng nghe sự kiện kết nối
    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    // Lắng nghe thông báo từ server (nếu có)
    newSocket.on("notification", (notification) => {
      message.info(`Thông báo: ${notification.message}`);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    // Dọn dẹp khi component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const onFinish = async (values) => {
    console.log("Form values:", values);

    // Kiểm tra Tên công ty
    if (!values.companyName) {
      message.error("Tên công ty không được để trống!");
      return;
    }

    // Tạo formData để gửi dữ liệu dạng multipart/form-data
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("confirmPassword", values.confirmPassword);
    formData.append("role", "employer");
    formData.append("company", values.companyName);
    formData.append("phoneNumber", values.phoneNumber);
    formData.append("taxId", values.taxId || "");
    formData.append("address", values.address || "");
    formData.append("positionNeeded", values.positionNeeded || "");
    formData.append("industry", values.industry || "");
    formData.append("budget", values.budget || "");
    formData.append(
      "needConsultation",
      values.needConsultation ? "true" : "false"
    );

    // Kiểm tra và thêm file logo (nếu có)
    if (values.companyLogo && values.companyLogo.length > 0) {
      const fileObj = values.companyLogo[0].originFileObj;
      if (fileObj && fileObj.size > 0) {
        console.log("File name:", fileObj.name);
        console.log("File size (bytes):", fileObj.size);
        console.log("File type:", fileObj.type);
        formData.append("logo", fileObj);
      } else {
        console.error("File logo rỗng hoặc không hợp lệ:", fileObj);
        message.error("File logo rỗng hoặc không hợp lệ. Vui lòng chọn lại!");
        return;
      }
    } else {
      console.log("Không có logo được chọn");
    }

    // Log chi tiết FormData
    console.log("FormData entries:");
    for (const [key, value] of formData.entries()) {
      if (key === "logo") {
        console.log(`  ${key}: ${value.name} (size: ${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register-employer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { user } = response.data;

      // Đăng ký userId với Socket.IO sau khi đăng ký thành công
      if (socket && user?._id) {
        socket.emit("register", user._id);
        console.log(`Registered user ${user._id} with socket`);
      }

      message.success("Đăng ký nhà tuyển dụng thành công!");
      navigate("/employer/login");
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
                THÔNG TIN ĐĂNG KÝ TÀI KHOẢN NHÀ TUYỂN DỤNG
              </h2>

              <div style={{ display: "flex", gap: 24 }}>
                {/* Form bên trái */}
                <div style={{ flex: 1 }}>
                  <Form
                    name="employerRegisterForm"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                  >
                    {/* Email */}
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
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      dependencies={["password"]}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng xác nhận mật khẩu!",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Mật khẩu xác nhận không khớp!")
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="Nhập lại mật khẩu" />
                    </Form.Item>

                    {/* Tên công ty */}
                    <Form.Item
                      label="Tên công ty (*)"
                      name="companyName"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên công ty!",
                        },
                      ]}
                    >
                      <Input placeholder="VD: Công ty TNHH ABC..." />
                    </Form.Item>

                    {/* Số điện thoại */}
                    <Form.Item
                      label="Số điện thoại (*)"
                      name="phoneNumber"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại!",
                        },
                      ]}
                    >
                      <Input placeholder="VD: 0912345678" />
                    </Form.Item>

                    {/* Mã số thuế */}
                    <Form.Item label="Mã số thuế" name="taxId">
                      <Input placeholder="VD: 1802001111" />
                    </Form.Item>

                    {/* Địa chỉ */}
                    <Form.Item label="Địa chỉ" name="address">
                      <Input placeholder="VD: 12 Nguyễn Văn Cừ, TP. Cần Thơ" />
                    </Form.Item>

                    {/* Vị trí tuyển dụng */}
                    <Form.Item
                      label="Bạn đang tuyển dụng vị trí nào?"
                      name="positionNeeded"
                    >
                      <Input placeholder="VD: Kỹ sư phần mềm, Nhân viên kinh doanh..." />
                    </Form.Item>

                    {/* Lĩnh vực */}
                    <Form.Item label="Lĩnh vực" name="industry">
                      <Select placeholder="Chọn lĩnh vực hoạt động">
                        <Option value="CNTT">Công nghệ thông tin</Option>
                        <Option value="XayDung">Xây dựng</Option>
                        <Option value="GiaoDuc">Giáo dục</Option>
                        <Option value="Khac">Khác</Option>
                      </Select>
                    </Form.Item>

                    {/* Ngân sách */}
                    <Form.Item
                      label="Ngân sách tuyển dụng cho vị trí này"
                      name="budget"
                    >
                      <Input placeholder="VD: 10.000.000" suffix="VND/tháng" />
                    </Form.Item>

                    {/* Có nhu cầu cần tư vấn thêm? */}
                    <Form.Item
                      label="Bạn có nhu cầu cần tư vấn thêm?"
                      name="needConsultation"
                      valuePropName="checked"
                    >
                      <Checkbox>Có</Checkbox>
                    </Form.Item>

                    {/* Logo công ty */}
                    <Form.Item
                      label="Logo công ty"
                      name="companyLogo"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                    >
                      <Upload
                        name="logo"
                        listType="picture"
                        maxCount={1}
                        beforeUpload={() => false}
                        accept="image/*"
                        showUploadList={true}
                      >
                        <Button icon={<UploadOutlined />}>Chọn Logo</Button>
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
                              : Promise.reject(
                                  new Error("Bạn cần đồng ý với điều khoản!")
                                ),
                        },
                      ]}
                    >
                      <Checkbox>
                        Đồng ý với các điều khoản của chúng tôi
                      </Checkbox>
                    </Form.Item>

                    {/* Nút đăng ký */}
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block>
                        ĐĂNG KÝ NHÀ TUYỂN DỤNG
                      </Button>
                    </Form.Item>
                  </Form>
                </div>

                {/* Cột phải: Thông tin */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: 15 }}>Đăng Ký Nhà Tuyển Dụng</h3>
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
                      +3.000.000 ứng viên tiếp cận thông tin tuyển dụng
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Không giới hạn tương tác với hồ sơ
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Quảng cáo thương hiệu công ty
                    </li>
                    <li>
                      <CheckOutlined
                        style={{ marginRight: 5, color: "orange" }}
                      />
                      Đăng tin nhanh chóng, tiện lợi
                    </li>
                  </ul>
                  <p style={{ lineHeight: 1.6 }}>
                    Chúng tôi cung cấp nền tảng kết nối nhà tuyển dụng với hàng
                    triệu ứng viên tiềm năng. Đăng ký ngay để trải nghiệm dịch
                    vụ tốt nhất!
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

export default EmployerRegisterPage;
