import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Input,
  Dropdown,
  Menu,
  Space,
  message,
} from "antd";
import {
  MailOutlined,
  UserOutlined,
  LoginOutlined,
  SolutionOutlined,
  CheckOutlined,
  CloseOutlined,
  UserAddOutlined,
  TeamOutlined,
  FacebookFilled,
  GoogleOutlined,
  DownOutlined,
  FileSearchOutlined,
  FileAddOutlined,
  EditOutlined,
  FileDoneOutlined,
  SaveOutlined,
  LockOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

message.config({
  top: 80,
  duration: 3,
});

const { Text } = Typography;

const Topbar = () => {
  const navigate = useNavigate();
  const [isMainLoginModalVisible, setIsMainLoginModalVisible] = useState(false);
  const [isCandidateModalVisible, setIsCandidateModalVisible] = useState(false);
  const [isEmployerModalVisible, setIsEmployerModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePassword, setCandidatePassword] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [employerPassword, setEmployerPassword] = useState("");
  const [candidateError, setCandidateError] = useState("");
  const [employerError, setEmployerError] = useState("");
  const [socket, setSocket] = useState(null);

  // Khởi tạo Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, skipping Socket.IO connection");
      return;
    }

    const socket = io("http://localhost:5000", {
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Socket.IO connected in Topbar");
    });

    socket.on("notification", (notification) => {
      console.log("Received Socket.IO notification:", notification);
      if (notification.type === "job_created") {
        message.success(`${notification.message} Xem tại trang việc làm!`);
      } else if (notification.type === "application_accepted") {
        message.success(notification.message);
      } else if (notification.type === "application_rejected") {
        message.warning(notification.message);
      } else {
        message.info(notification.message);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      try {
        setLoggedInUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi parse loggedInUser:", error);
      }
    }
  }, []);

  // Lắng nghe sự thay đổi của localStorage
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "loggedInUser" || event.key === "token") {
        updateLoginStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const updateLoginStatus = () => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      try {
        setLoggedInUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi parse loggedInUser:", error);
        setLoggedInUser(null);
      }
    } else {
      setLoggedInUser(null);
    }
  };

  const showMainLoginModal = () => setIsMainLoginModalVisible(true);
  const handleCancelMainLogin = () => setIsMainLoginModalVisible(false);

  const openCandidateModal = () => {
    setIsMainLoginModalVisible(false);
    setIsCandidateModalVisible(true);
  };
  const handleCancelCandidate = () => {
    setCandidateEmail("");
    setCandidatePassword("");
    setCandidateError("");
    setIsCandidateModalVisible(false);
  };

  const openEmployerModal = () => {
    setIsMainLoginModalVisible(false);
    setIsEmployerModalVisible(true);
  };
  const handleCancelEmployer = () => {
    setEmployerEmail("");
    setEmployerPassword("");
    setEmployerError("");
    setIsEmployerModalVisible(false);
  };

  const showRegisterModal = () => setIsRegisterModalVisible(true);
  const handleCancelRegister = () => setIsRegisterModalVisible(false);

  const handleUserRegister = () => {
    setIsRegisterModalVisible(false);
    navigate("/user/register");
  };
  const handleEmployerRegister = () => {
    setIsRegisterModalVisible(false);
    navigate("/employer/register");
  };

  const handleCandidateLogin = async () => {
    setCandidateError("");
    if (!candidateEmail.trim() || !candidatePassword.trim()) {
      message.error("Vui lòng nhập email và mật khẩu!");
      setCandidateError("Vui lòng nhập email và mật khẩu!");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email: candidateEmail, password: candidatePassword },
        { withCredentials: true }
      );
      const user = response.data.user;
      if (user && user.role === "user") {
        message.success(
          `Đăng nhập thành công. Chào ${user.fullName || user.name}!`
        );
        setLoggedInUser(user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        setIsCandidateModalVisible(false);
        setCandidateEmail("");
        setCandidatePassword("");
        setCandidateError("");
        navigate("/user/dashboard");
      } else {
        message.error("Tài khoản không phải người dùng!");
        setCandidateError("Tài khoản không phải người dùng!");
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Email hoặc mật khẩu không đúng!";
      message.error(errMsg);
      setCandidateError(errMsg);
    }
  };

  const handleEmployerLogin = async () => {
    setEmployerError("");
    if (!employerEmail.trim() || !employerPassword.trim()) {
      message.error("Vui lòng nhập email và mật khẩu!");
      setEmployerError("Vui lòng nhập email và mật khẩu!");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email: employerEmail, password: employerPassword },
        { withCredentials: true }
      );
      const user = response.data.user;
      if (user && user.role === "employer") {
        message.success(
          `Đăng nhập thành công. Chào ${user.fullName || user.name}!`
        );
        setLoggedInUser(user);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        setIsEmployerModalVisible(false);
        setEmployerEmail("");
        setEmployerPassword("");
        setEmployerError("");
        navigate("/employer/dashboard");
      } else {
        message.error("Tài khoản không phải nhà tuyển dụng!");
        setEmployerError("Tài khoản không phải nhà tuyển dụng!");
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Email hoặc mật khẩu không đúng!";
      message.error(errMsg);
      setEmployerError(errMsg);
    }
  };

  const menuAfterLogin = (
    <Menu>
      <Menu.Item key="greeting" disabled style={{ fontWeight: "bold" }}>
        Xin chào {loggedInUser?.fullName || loggedInUser?.name}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="1"
        icon={<SolutionOutlined />}
        onClick={() => {
          if (loggedInUser?.role === "user") {
            navigate("/user/dashboard");
          } else if (loggedInUser?.role === "employer") {
            navigate("/employer/dashboard");
          }
        }}
      >
        Trang quản lý
      </Menu.Item>
      <Menu.Item
        key="2"
        icon={<FileSearchOutlined />}
        onClick={() => navigate("/profile")}
      >
        Xem CV
      </Menu.Item>
      <Menu.Item
        key="3"
        icon={<FileAddOutlined />}
        onClick={() => navigate("/create-cv")}
      >
        Tạo CV
      </Menu.Item>
      <Menu.Item
        key="4"
        icon={<EditOutlined />}
        onClick={() => navigate("/edit-cv")}
      >
        Chỉnh sửa CV
      </Menu.Item>
      <Menu.Item
        key="5"
        icon={<FileDoneOutlined />}
        onClick={() => navigate("/applied-jobs")}
      >
        Việc làm đã nộp
      </Menu.Item>
      <Menu.Item
        key="6"
        icon={<SaveOutlined />}
        onClick={() => navigate("/saved-jobs")}
      >
        Việc làm đã lưu
      </Menu.Item>
      <Menu.Item
        key="7"
        icon={<LockOutlined />}
        onClick={() => navigate("/account-security")}
      >
        Tài khoản và bảo mật
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="8"
        icon={<LogoutOutlined />}
        onClick={() => {
          localStorage.removeItem("loggedInUser");
          localStorage.removeItem("token");
          setLoggedInUser(null);
          message.info("Đã đăng xuất");
          setCandidateEmail("");
          setCandidatePassword("");
          setEmployerEmail("");
          setEmployerPassword("");
          setCandidateError("");
          setEmployerError("");
          navigate("/"); // Điều hướng về trang chủ sau khi đăng xuất
        }}
      >
        Thoát
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #0073e6 0%, #00bfff 100%)",
        padding: "10px 20px",
        color: "white",
        fontSize: 14,
      }}
    >
      <Row justify="space-around" align="middle">
        <Col>
          <Text style={{ marginRight: 20, marginLeft: 15 }}>
            <SolutionOutlined style={{ marginRight: 5 }} />
            Đăng tuyển: 0916926439
          </Text>
          <Text style={{ marginRight: 15 }}>Tìm việc: 0916926436</Text>
          <Text style={{ marginRight: 15 }}>Phone: 0916926436</Text>
          <Text style={{ marginRight: 15 }}>
            <MailOutlined style={{ marginRight: 5 }} />
            duc12a111@gmail.com
          </Text>
        </Col>
        <Col>
          {loggedInUser ? (
            <Dropdown overlay={menuAfterLogin} trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                Tài khoản <DownOutlined />
              </Space>
            </Dropdown>
          ) : (
            <>
              <Text style={{ marginRight: 15 }}>
                <LoginOutlined style={{ marginRight: 5 }} />
                <a
                  onClick={showMainLoginModal}
                  style={{
                    color: "white",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Đăng nhập
                </a>{" "}
                | <UserAddOutlined style={{ marginRight: 5 }} />
                <a
                  onClick={showRegisterModal}
                  style={{
                    color: "white",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Đăng ký
                </a>
              </Text>
              <Button
                style={{
                  backgroundColor: "#ff6600",
                  color: "white",
                  border: "none",
                  fontWeight: "bold",
                  marginLeft: 10,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e65c00")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ff6600")
                }
              >
                Dành cho nhà tuyển dụng
              </Button>
            </>
          )}
        </Col>
      </Row>

      <Modal
        visible={isMainLoginModalVisible}
        footer={null}
        width={800}
        closable={false}
        onCancel={handleCancelMainLogin}
        style={{ top: 150 }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            backgroundColor: "#0073e6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
          }}
        >
          <h2 style={{ color: "#fff", margin: 0 }}>
            <LoginOutlined style={{ marginRight: 8 }} />
            ĐĂNG NHẬP HỆ THỐNG
          </h2>
          <CloseOutlined
            onClick={handleCancelMainLogin}
            style={{ color: "#fff", fontSize: 20, cursor: "pointer" }}
          />
        </div>
        <div style={{ padding: 24, backgroundColor: "#fff" }}>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: "orange" }}>
                <TeamOutlined style={{ marginRight: 5 }} />
                Đăng nhập nhà tuyển dụng
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  lineHeight: 1.6,
                  marginBottom: 0,
                }}
              >
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  +3.000.000 ứng viên tiềm năng
                </li>
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  Không giới hạn tương tác với ứng viên
                </li>
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  Quảng cáo tuyển dụng hiệu quả
                </li>
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  Đăng tin nhanh chóng, tiện lợi
                </li>
              </ul>
              <button
                style={{
                  width: "100%",
                  marginTop: 10,
                  backgroundColor: "orange",
                  color: "#fff",
                  border: "none",
                  padding: "10px 0",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ff9f33")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "orange")
                }
                onClick={openEmployerModal}
              >
                <TeamOutlined style={{ marginRight: 5 }} />
                Đăng nhập nhà tuyển dụng
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: "blue" }}>
                <UserOutlined style={{ marginRight: 5 }} />
                Đăng nhập người dùng
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  lineHeight: 1.6,
                  marginBottom: 0,
                }}
              >
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  +1.500.000 công việc được cập nhật
                </li>
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  Hoàn toàn miễn phí
                </li>
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  Hỗ trợ tạo CV online
                </li>
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  Tìm việc làm nhanh chóng
                </li>
              </ul>
              <button
                style={{
                  width: "100%",
                  marginTop: 10,
                  backgroundColor: "#1890ff",
                  color: "#fff",
                  border: "none",
                  padding: "10px 0",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#40a9ff")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1890ff")
                }
                onClick={openCandidateModal}
              >
                <UserOutlined style={{ marginRight: 5 }} />
                Đăng nhập người dùng
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        visible={isEmployerModalVisible}
        footer={null}
        width={800}
        closable={false}
        onCancel={handleCancelEmployer}
        style={{ top: 150 }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            backgroundColor: "#0073e6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
          }}
        >
          <h2 style={{ color: "#fff", margin: 0 }}>
            <TeamOutlined style={{ marginRight: 5 }} />
            ĐĂNG NHẬP (Nhà tuyển dụng)
          </h2>
          <CloseOutlined
            onClick={handleCancelEmployer}
            style={{ color: "#fff", fontSize: 20, cursor: "pointer" }}
          />
        </div>
        <div style={{ padding: 24, backgroundColor: "#fff" }}>
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <img
                src="https://picsum.photos/400/300"
                alt="Hình minh hoạ"
                style={{ width: "100%", borderRadius: 8 }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <h3 style={{ color: "orange" }}>Đăng nhập nhà tuyển dụng</h3>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  lineHeight: 1.6,
                  marginBottom: 0,
                }}
              >
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  +3.000.000 ứng viên tiếp cận
                </li>
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  Không giới hạn tương tác
                </li>
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  Quảng cáo tuyển dụng hiệu quả
                </li>
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  Đăng tin nhanh chóng, tiện lợi
                </li>
              </ul>
              {employerError && (
                <p style={{ color: "red", marginTop: 10 }}>{employerError}</p>
              )}
              <div style={{ marginTop: 10 }}>
                <label style={{ display: "block", marginBottom: 5 }}>
                  Email đăng nhập
                </label>
                <Input
                  type="email"
                  value={employerEmail}
                  onChange={(e) => setEmployerEmail(e.target.value)}
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
                <label style={{ display: "block", marginBottom: 5 }}>
                  Mật khẩu
                </label>
                <Input.Password
                  value={employerPassword}
                  onChange={(e) => setEmployerPassword(e.target.value)}
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
                <Button
                  type="primary"
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    backgroundColor: "orange",
                    border: "none",
                  }}
                  onClick={handleEmployerLogin}
                >
                  Đăng nhập nhà tuyển dụng
                </Button>
                <div style={{ textAlign: "center" }}>
                  <a href="/user/forgot-password">Quên mật khẩu?</a> |{" "}
                  <a
                    onClick={() => navigate("/employer/register")}
                    style={{ cursor: "pointer", color: "#1890ff" }}
                  >
                    Chưa có tài khoản? Đăng ký
                  </a>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>

      <Modal
        visible={isCandidateModalVisible}
        footer={null}
        width={800}
        closable={false}
        onCancel={handleCancelCandidate}
        style={{ top: 150 }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            backgroundColor: "#0073e6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
          }}
        >
          <h2 style={{ color: "#fff", margin: 0 }}>
            <UserOutlined style={{ marginRight: 5 }} />
            ĐĂNG NHẬP (Người dùng)
          </h2>
          <CloseOutlined
            onClick={handleCancelCandidate}
            style={{ color: "#fff", fontSize: 20, cursor: "pointer" }}
          />
        </div>
        <div style={{ padding: 24, backgroundColor: "#fff" }}>
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <h3 style={{ color: "blue" }}>Đăng nhập người dùng</h3>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  lineHeight: 1.6,
                  marginBottom: 0,
                }}
              >
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  +1.500.000 công việc cập nhật
                </li>
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  Hoàn toàn miễn phí
                </li>
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  Nhận hồ sơ đa dạng
                </li>
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  Tìm kiếm việc nhanh chóng
                </li>
              </ul>
              {candidateError && (
                <p style={{ color: "red", marginTop: 10 }}>{candidateError}</p>
              )}
              <div style={{ marginTop: 10 }}>
                <label style={{ display: "block", marginBottom: 5 }}>
                  Email đăng nhập
                </label>
                <Input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
                <label style={{ display: "block", marginBottom: 5 }}>
                  Mật khẩu
                </label>
                <Input.Password
                  value={candidatePassword}
                  onChange={(e) => setCandidatePassword(e.target.value)}
                  style={{
                    width: "100%",
                    marginBottom: 10,
                    padding: 8,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
                <Button
                  type="primary"
                  style={{ width: "100%", marginBottom: 10 }}
                  onClick={handleCandidateLogin}
                >
                  Đăng nhập người dùng
                </Button>
                <div style={{ textAlign: "center" }}>
                  <Button
                    style={{
                      marginRight: 10,
                      backgroundColor: "#1877f2",
                      color: "#fff",
                      border: "none",
                    }}
                    icon={<FacebookFilled style={{ marginRight: 5 }} />}
                  >
                    Facebook
                  </Button>
                  <Button
                    style={{
                      backgroundColor: "#db4437",
                      color: "#fff",
                      border: "none",
                    }}
                    icon={<GoogleOutlined style={{ marginRight: 5 }} />}
                  >
                    Google
                  </Button>
                </div>
                <div style={{ marginTop: 10, textAlign: "center" }}>
                  <a
                    onClick={() => navigate("/user/forgot-password")}
                    style={{ cursor: "pointer", color: "#1890ff" }}
                  >
                    Quên mật khẩu?
                  </a>{" "}
                  |{" "}
                  <a
                    onClick={() => navigate("/user/register")}
                    style={{ cursor: "pointer", color: "#1890ff" }}
                  >
                    Chưa có tài khoản? Đăng ký
                  </a>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <img
                src="https://picsum.photos/400/300"
                alt="Hình minh hoạ"
                style={{ width: "100%", borderRadius: 8 }}
              />
            </Col>
          </Row>
        </div>
      </Modal>

      <Modal
        visible={isRegisterModalVisible}
        footer={null}
        width={800}
        closable={false}
        onCancel={handleCancelRegister}
        style={{ top: 150 }}
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            backgroundColor: "#0073e6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
          }}
        >
          <h2 style={{ color: "#fff", margin: 0 }}>
            <UserAddOutlined style={{ marginRight: 5 }} />
            ĐĂNG KÝ
          </h2>
          <CloseOutlined
            onClick={handleCancelRegister}
            style={{ color: "#fff", fontSize: 20, cursor: "pointer" }}
          />
        </div>
        <div style={{ padding: 24, backgroundColor: "#fff" }}>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: "blue" }}>
                <UserOutlined style={{ marginRight: 5 }} />
                Đăng ký ứng viên
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  lineHeight: 1.6,
                  marginBottom: 0,
                }}
              >
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  +1.500.000 công việc được cập nhật thường xuyên
                </li>
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  Hoàn toàn miễn phí
                </li>
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  Hỗ trợ tạo CV online
                </li>
                <li>
                  <CheckOutlined style={{ color: "blue", marginRight: 8 }} />
                  Tìm việc làm nhanh chóng
                </li>
              </ul>
              <button
                style={{
                  width: "100%",
                  marginTop: 10,
                  backgroundColor: "#1890ff",
                  color: "#fff",
                  border: "none",
                  padding: "10px 0",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#40a9ff")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1890ff")
                }
                onClick={handleUserRegister}
              >
                <UserOutlined style={{ marginRight: 5 }} />
                Đăng ký ứng viên
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: "orange" }}>
                <TeamOutlined style={{ marginRight: 5 }} />
                Đăng ký nhà tuyển dụng
              </h3>
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  lineHeight: 1.6,
                  marginBottom: 0,
                }}
              >
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  +3.000.000 ứng viên tiềm năng
                </li>
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  Đăng tin miễn phí
                </li>
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  Quảng cáo tuyển dụng hiệu quả
                </li>
                <li>
                  <CheckOutlined style={{ color: "orange", marginRight: 8 }} />
                  Quản lý hồ sơ đơn giản
                </li>
              </ul>
              <button
                style={{
                  width: "100%",
                  marginTop: 10,
                  backgroundColor: "orange",
                  color: "#fff",
                  border: "none",
                  padding: "10px 0",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ff9f33")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "orange")
                }
                onClick={handleEmployerRegister}
              >
                <TeamOutlined style={{ marginRight: 5 }} />
                Đăng ký nhà tuyển dụng
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Topbar;
