import React, { useEffect, useState } from "react";
import {
  Steps,
  Form,
  Input,
  Button,
  Radio,
  Row,
  Col,
  Select,
  Rate,
  message,
  Checkbox,
  Modal,
  Upload,
} from "antd";
import {
  UserOutlined,
  ProfileOutlined,
  ReadOutlined,
  ToolOutlined,
  BulbOutlined,
  GlobalOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { io } from "socket.io-client";
import "../../../styles/UserDashboardPage.css";

const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;

const UserUpdatePage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cvData, setCvData] = useState({});
  const [isCvIncomplete, setIsCvIncomplete] = useState(false);
  const [userId, setUserId] = useState(null); // Thêm state để lưu userId
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [form4] = Form.useForm();
  const [form5] = Form.useForm();
  const [form6] = Form.useForm();
  const [isEducationModalVisible, setIsEducationModalVisible] = useState(false);
  const [isWorkExperienceModalVisible, setIsWorkExperienceModalVisible] =
    useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [socket, setSocket] = useState(null);

  // Education data
  const [educationData, setEducationData] = useState({
    tenBangCap: "",
    donViDaoTao: "",
    thoiGianBatDau: { thang: "01", nam: "2020" },
    thoiGianKetThuc: { thang: "12", nam: "2023" },
    xepLoai: "Khá",
    imageUrl: "",
  });
  const [educationList, setEducationList] = useState([]);
  const [editingEducationIndex, setEditingEducationIndex] = useState(null);

  // Work experience data
  const [currentWorkExperience, setCurrentWorkExperience] = useState({
    tenCongTy: "",
    chucDanh: "",
    thoiGianBatDau: { thang: "01", nam: "2020" },
    thoiGianKetThuc: { thang: "12", nam: "2023" },
    dangLamViec: false,
    moTa: "",
  });
  const [editingWorkExperienceIndex, setEditingWorkExperienceIndex] =
    useState(null);

  // Fixed soft skills
  const fixedSoftSkills = [
    { name: "Giải quyết vấn đề", rating: 0, description: "", checked: false },
    { name: "Lãnh đạo", rating: 0, description: "", checked: false },
    {
      name: "Giao tiếp và tạo lập quan hệ",
      rating: 0,
      description: "",
      checked: false,
    },
    { name: "Tư duy sáng tạo", rating: 0, description: "", checked: false },
    {
      name: "Đàm phán thuyết phục",
      rating: 0,
      description: "",
      checked: false,
    },
    { name: "Quản lý bản thân", rating: 0, description: "", checked: false },
    { name: "Làm việc nhóm", rating: 0, description: "", checked: false },
    {
      name: "Phát triển cá nhân sự nghiệp",
      rating: 0,
      description: "",
      checked: false,
    },
    { name: "Học và tự học", rating: 0, description: "", checked: false },
    { name: "Lắng nghe", rating: 0, description: "", checked: false },
    {
      name: "Tổ chức công việc hiệu quả",
      rating: 0,
      description: "",
      checked: false,
    },
  ];

  const [softSkills, setSoftSkills] = useState(fixedSoftSkills);
  const [professionalSkills, setProfessionalSkills] = useState([
    { name: "", checked: false, rating: 3, description: "" },
  ]);

  // Language and IT skills
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState({
    name: "",
    listening: "Khá",
    speaking: "Khá",
    writing: "Khá",
    reading: "Khá",
  });
  const [itSkills, setITSkills] = useState([
    { name: "MS Word", proficiency: "Khá" },
    { name: "MS Excel", proficiency: "Khá" },
    { name: "MS PowerPoint", proficiency: "Khá" },
    { name: "Photoshop", proficiency: "Khá" },
  ]);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("notification", (data) => {
      message.info(data.message);
      console.log("Notification from server:", data);
    });

    fetchCV();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchCV = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.warning("Bạn chưa đăng nhập!");
        return;
      }

      const userRes = await axios.get("http://localhost:5000/api/user/getme", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = userRes.data.user;
      setUserId(userData._id); // Lưu userId vào state

      const maHoSo = `CV-${uuidv4().slice(0, 8).toUpperCase()}`;
      let userInfo = {
        maHoSo,
        email: userData.email || "",
        hoTen: userData.name || "",
        phone: userData.phone || "",
        ngaySinh: "",
        diaChi: "",
        gioiTinh: userData.gioiTinh || "male",
        honNhan: "single",
      };

      let cvData = {};
      try {
        const cvRes = await axios.get("http://localhost:5000/api/cv", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cvs = cvRes.data.cvs || [];
        console.log("Dữ liệu CV từ backend:", cvs);
        cvData = cvs.length > 0 ? cvs[0] : {};
        if (cvs.length === 0) {
          console.log("Chưa có CV, sử dụng dữ liệu mặc định");
          setIsCvIncomplete(true);
        }

        userInfo.ngaySinh = cvData.ngaySinh
          ? new Date(cvData.ngaySinh).toISOString().split("T")[0]
          : userData.ngaySinh
            ? new Date(userData.ngaySinh).toISOString().split("T")[0]
            : "";
        userInfo.diaChi = cvData.diaChi || userData.diaChi || "";
        userInfo.email = cvData.email || userData.email || "";
      } catch (cvError) {
        if (cvError.response && cvError.response.status === 404) {
          console.log("Chưa có CV, sử dụng dữ liệu mặc định");
          setIsCvIncomplete(true);
        } else {
          throw cvError;
        }
      }

      console.log("userInfo after merge:", userInfo);
      setCvData({ ...userInfo, ...cvData });
      form1.setFieldsValue(userInfo);
      console.log("Form1 fields after set:", form1.getFieldsValue());
      form2.setFieldsValue(cvData);

      setEducationList(cvData.educationList || []);
      setLanguages(cvData.languages || []);
      setITSkills(cvData.itSkills || itSkills);

      if (cvData.kyNangMem && Array.isArray(cvData.kyNangMem)) {
        const updatedSoftSkills = fixedSoftSkills.map((fixedSkill) => {
          const serverSkill = cvData.kyNangMem.find(
            (s) => s && typeof s === "object" && s.name === fixedSkill.name
          );
          if (serverSkill && typeof serverSkill === "object") {
            return {
              name: serverSkill.name || fixedSkill.name,
              rating: Number(serverSkill.rating) || 0,
              description: serverSkill.description || "",
              checked: Boolean(serverSkill.checked) || false,
            };
          }
          return fixedSkill;
        });
        setSoftSkills(updatedSoftSkills);
        console.log("Updated softSkills:", updatedSoftSkills);
      } else {
        setSoftSkills(fixedSoftSkills);
      }

      if (cvData.lapTrinh && Array.isArray(cvData.lapTrinh)) {
        const updatedProfessionalSkills = cvData.lapTrinh
          .filter(
            (skill) =>
              skill && typeof skill === "object" && skill.name && skill.rating
          )
          .map((skill) => ({
            name: skill.name || "",
            rating: Number(skill.rating) || 3,
            description: skill.description || "",
            checked: Boolean(skill.checked) || false,
          }));
        setProfessionalSkills(
          updatedProfessionalSkills.length > 0
            ? updatedProfessionalSkills
            : [{ name: "", checked: false, rating: 3, description: "" }]
        );
        console.log("Updated professionalSkills:", updatedProfessionalSkills);
      } else {
        setProfessionalSkills([
          { name: "", checked: false, rating: 3, description: "" },
        ]);
      }
    } catch (error) {
      console.error("fetchCV error:", error);
      message.error("Không thể tải thông tin!");
    }
  };

  const onChangeStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const onFinishStep1 = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/user/update", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCvData((prev) => ({ ...prev, ...values }));
      setCurrentStep(1);
      message.success("Cập nhật thông tin cá nhân thành công!");
      fetchCV();
    } catch (error) {
      console.error("Update error:", error);
      message.error("Không thể cập nhật thông tin!");
    }
  };

  const onFinishStep2 = (values) => {
    setCvData((prev) => ({ ...prev, ...values }));
    setCurrentStep(2);
    setIsCvIncomplete(false);
  };

  const onFinishStep3 = (values) => {
    setCvData((prev) => ({ ...prev, ...values }));
    setCurrentStep(3);
  };

  const onFinishStep5 = (values) => {
    const skillData = {
      kyNangMem: softSkills
        .filter((skill) => skill.checked)
        .map(({ name, rating, description }) => ({
          name,
          rating,
          description,
        })),
      lapTrinh: professionalSkills
        .filter((skill) => skill.checked)
        .map(({ name, rating, description }) => ({
          name,
          rating,
          description,
        })),
    };
    setCvData((prev) => ({ ...prev, ...values, ...skillData }));
    setCurrentStep(5);
  };

  const onFinishStep6 = async (values) => {
    const finalData = {
      ...cvData,
      ...values,
      educationList: educationList || [],
      languages: languages || [],
      itSkills: itSkills || [],
      kyNangMem: softSkills
        .filter((skill) => skill.checked && skill.rating >= 1)
        .map((skill) => ({
          name: skill.name,
          rating: skill.rating,
          description: skill.description,
          checked: skill.checked,
        })),
      lapTrinh: professionalSkills
        .filter((skill) => skill.checked && skill.name && skill.rating >= 1)
        .map((skill) => ({
          name: skill.name,
          rating: skill.rating,
          description: skill.description,
          checked: skill.checked,
        })),
      kinhNghiemList: (cvData.kinhNghiemList || []).filter(
        (exp) => exp.tenCongTy && exp.chucDanh && exp.moTa
      ),
    };

    console.log("Dữ liệu gửi đi (đầy đủ):", JSON.stringify(finalData, null, 2));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.warning("Bạn chưa đăng nhập!");
        return;
      }

      const method = finalData._id ? "put" : "post";
      const url = finalData._id
        ? `http://localhost:5000/api/cv/${finalData._id}`
        : "http://localhost:5000/api/cv";

      const response = await axios({
        method,
        url,
        data: finalData,
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(
        finalData._id ? "Cập nhật CV thành công!" : "Tạo CV thành công!"
      );
      setIsCvIncomplete(false);
      setCurrentStep(0);
      fetchCV();

      if (socket) {
        socket.emit("cvUpdated", {
          message: "CV đã được cập nhật/tạo mới!",
          userId: userId, // Sử dụng userId từ state
        });
      }
    } catch (error) {
      console.error("Error updating CV:", error.response?.data || error);
      message.error(
        error.response?.data?.message || "Không thể cập nhật/tạo CV!"
      );
    }
  };

  // Step render functions
  const renderStep1 = () => (
    <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
      <Steps
        size="small"
        current={0}
        onChange={onChangeStep}
        style={{ marginBottom: 20 }}
      >
        <Step icon={<UserOutlined />} title="Thông tin cá nhân" />
        <Step icon={<ProfileOutlined />} title="Thông tin hồ sơ" />
        <Step icon={<ReadOutlined />} title="Học vấn bằng cấp" />
        <Step icon={<ToolOutlined />} title="Kinh nghiệm làm việc" />
        <Step icon={<BulbOutlined />} title="Kỹ năng" />
        <Step icon={<GlobalOutlined />} title="Tin học - Ngoại ngữ" />
      </Steps>

      {isCvIncomplete && (
        <div
          style={{ marginBottom: 20, color: "#faad14", textAlign: "center" }}
        >
          Vui lòng hoàn tất cập nhật hồ sơ để tiếp cận nhà tuyển dụng tốt hơn.
        </div>
      )}

      <Form form={form1} layout="vertical" onFinish={onFinishStep1}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Mã hồ sơ" name="maHoSo">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: !form1.getFieldValue("email"),
                  message: "Vui lòng nhập email!",
                },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Họ tên"
              name="hoTen"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Ngày sinh"
              name="ngaySinh"
              rules={[{ required: true, message: "Vui lòng nhập ngày sinh!" }]}
            >
              <Input type="date" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Giới tính"
              name="gioiTinh"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Radio.Group>
                <Radio value="male">Nam</Radio>
                <Radio value="female">Nữ</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Địa chỉ"
              name="diaChi"
              rules={[
                {
                  required: !form1.getFieldValue("diaChi"),
                  message: "Vui lòng nhập địa chỉ!",
                },
              ]}
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Tình trạng hôn nhân"
              name="honNhan"
              rules={[{ required: true, message: "Vui lòng chọn tình trạng!" }]}
            >
              <Radio.Group>
                <Radio value="single">Độc thân</Radio>
                <Radio value="married">Đã kết hôn</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Tiếp theo
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
      <Steps
        size="small"
        current={1}
        onChange={onChangeStep}
        style={{ marginBottom: 20 }}
      >
        <Step icon={<UserOutlined />} title="Thông tin cá nhân" />
        <Step icon={<ProfileOutlined />} title="Thông tin hồ sơ" />
        <Step icon={<ReadOutlined />} title="Học vấn bằng cấp" />
        <Step icon={<ToolOutlined />} title="Kinh nghiệm làm việc" />
        <Step icon={<BulbOutlined />} title="Kỹ năng" />
        <Step icon={<GlobalOutlined />} title="Tin học - Ngoại ngữ" />
      </Steps>

      <Form form={form2} layout="vertical" onFinish={onFinishStep2}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Vị trí mong muốn"
              name="nganhNgheMongMuon"
              rules={[{ required: true, message: "Vui lòng chọn vị trí!" }]}
            >
              <Select placeholder="Chọn vị trí mong muốn">
                <Option value="CNTT - Phần mềm">CNTT - Phần mềm</Option>
                <Option value="Bán hàng/Kinh doanh">Bán hàng/Kinh doanh</Option>
                <Option value="Dịch vụ khách hàng">Dịch vụ khách hàng</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Cấp bậc"
              name="capBac"
              rules={[{ required: true, message: "Vui lòng chọn cấp bậc!" }]}
            >
              <Select placeholder="Chọn cấp bậc">
                <Option value="Nhân viên">Nhân viên</Option>
                <Option value="Trưởng nhóm">Trưởng nhóm</Option>
                <Option value="Quản lý">Quản lý</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Mức lương mong muốn"
              name="mucLuongMongMuon"
              rules={[{ required: true, message: "Vui lòng chọn mức lương!" }]}
            >
              <Select placeholder="Chọn mức lương">
                <Option value="3 - 5 triệu">3 - 5 triệu</Option>
                <Option value="5 - 7 triệu">5 - 7 triệu</Option>
                <Option value="7 - 10 triệu">7 - 10 triệu</Option>
                <Option value="Trên 10 triệu">Trên 10 triệu</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Kinh nghiệm"
              name="kinhNghiem"
              rules={[
                { required: true, message: "Vui lòng chọn kinh nghiệm!" },
              ]}
            >
              <Select placeholder="Chọn kinh nghiệm">
                <Option value="Dưới 1 năm">Dưới 1 năm</Option>
                <Option value="1 - 2 năm">1 - 2 năm</Option>
                <Option value="2 - 5 năm">2 - 5 năm</Option>
                <Option value="Trên 5 năm">Trên 5 năm</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Hình thức việc làm"
              name="hinhThuc"
              rules={[{ required: true, message: "Vui lòng chọn hình thức!" }]}
            >
              <Select placeholder="Chọn hình thức">
                <Option value="Toàn thời gian">Toàn thời gian</Option>
                <Option value="Bán thời gian">Bán thời gian</Option>
                <Option value="Freelance">Freelance</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Nơi làm việc"
              name="noiLamViec"
              rules={[
                { required: true, message: "Vui lòng chọn nơi làm việc!" },
              ]}
            >
              <Select placeholder="Chọn nơi làm việc">
                <Option value="Hà Nội">Hà Nội</Option>
                <Option value="HCM">HCM</Option>
                <Option value="Đà Nẵng">Đà Nẵng</Option>
                <Option value="Cần Thơ">Cần Thơ</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Mục tiêu nghề nghiệp"
          name="mucTieu"
          rules={[{ required: true, message: "Vui lòng nhập mục tiêu!" }]}
        >
          <TextArea rows={3} placeholder="Viết mục tiêu nghề nghiệp..." />
        </Form.Item>
        <Form.Item
          label="Mục tiêu nghề nghiệp khác"
          name="mucTieuNgheNghiep"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất một mục tiêu!" },
          ]}
        >
          <Checkbox.Group style={{ width: "100%" }}>
            <Row>
              <Col span={24}>
                <Checkbox value="Tìm công việc lương cao">
                  Tìm công việc lương cao
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="Công việc ổn định">
                  Công việc ổn định lâu dài
                </Checkbox>
              </Col>
              <Col span={24}>
                <Checkbox value="Học hỏi thêm kỹ năng">
                  Học hỏi thêm kỹ năng
                </Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Tiếp theo
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const renderStep3 = () => {
    const handleEditEducation = (index) => {
      setEditingEducationIndex(index);
      setEducationData(educationList[index]);
      setIsEducationModalVisible(true);
    };

    return (
      <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
        <Steps
          size="small"
          current={2}
          onChange={onChangeStep}
          style={{ marginBottom: 20 }}
        >
          <Step icon={<UserOutlined />} title="Thông tin cá nhân" />
          <Step icon={<ProfileOutlined />} title="Thông tin hồ sơ" />
          <Step icon={<ReadOutlined />} title="Học vấn bằng cấp" />
          <Step icon={<ToolOutlined />} title="Kinh nghiệm làm việc" />
          <Step icon={<BulbOutlined />} title="Kỹ năng" />
          <Step icon={<GlobalOutlined />} title="Tin học - Ngoại ngữ" />
        </Steps>

        <h3 style={{ marginBottom: 15 }}>Học vấn bằng cấp</h3>
        <Button
          type="primary"
          onClick={() => {
            setEditingEducationIndex(null);
            setEducationData({
              tenBangCap: "",
              donViDaoTao: "",
              thoiGianBatDau: { thang: "01", nam: "2020" },
              thoiGianKetThuc: { thang: "12", nam: "2023" },
              xepLoai: "Khá",
              imageUrl: "",
            });
            setIsEducationModalVisible(true);
          }}
          style={{ marginBottom: 20 }}
        >
          Cập nhật học vấn
        </Button>
        {educationList.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4>Danh sách học vấn:</h4>
            <ul>
              {educationList.map((edu, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={{ flex: 1 }}>
                    {edu.tenBangCap} - {edu.donViDaoTao} (
                    {edu.thoiGianBatDau.thang}/{edu.thoiGianBatDau.nam} -{" "}
                    {edu.thoiGianKetThuc.thang}/{edu.thoiGianKetThuc.nam})
                  </span>
                  <Button
                    type="link"
                    onClick={() => handleEditEducation(index)}
                    style={{ marginLeft: 10 }}
                  >
                    Chỉnh sửa
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Form form={form3} layout="vertical" onFinish={onFinishStep3}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tiếp theo
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  const renderStep4 = () => {
    const handleEditWorkExperience = (index) => {
      setEditingWorkExperienceIndex(index);
      setCurrentWorkExperience(cvData.kinhNghiemList[index]);
      setIsWorkExperienceModalVisible(true);
    };

    return (
      <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
        <Steps
          size="small"
          current={3}
          onChange={onChangeStep}
          style={{ marginBottom: 20 }}
        >
          <Step icon={<UserOutlined />} title="Thông tin cá nhân" />
          <Step icon={<ProfileOutlined />} title="Thông tin hồ sơ" />
          <Step icon={<ReadOutlined />} title="Học vấn bằng cấp" />
          <Step icon={<ToolOutlined />} title="Kinh nghiệm làm việc" />
          <Step icon={<BulbOutlined />} title="Kỹ năng" />
          <Step icon={<GlobalOutlined />} title="Tin học - Ngoại ngữ" />
        </Steps>

        <h3 style={{ marginBottom: 15 }}>Kinh nghiệm làm việc</h3>
        <Button
          type="primary"
          onClick={() => {
            setEditingWorkExperienceIndex(null);
            setCurrentWorkExperience({
              tenCongTy: "",
              chucDanh: "",
              thoiGianBatDau: { thang: "01", nam: "2020" },
              thoiGianKetThuc: { thang: "12", nam: "2023" },
              dangLamViec: false,
              moTa: "",
            });
            setIsWorkExperienceModalVisible(true);
          }}
          style={{ marginBottom: 20 }}
        >
          + Thêm kinh nghiệm
        </Button>
        {cvData.kinhNghiemList?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4>Danh sách kinh nghiệm:</h4>
            <ul>
              {cvData.kinhNghiemList.map((exp, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={{ flex: 1 }}>
                    {exp.tenCongTy} - {exp.chucDanh} (
                    {exp.thoiGianBatDau?.thang}/{exp.thoiGianBatDau?.nam} -{" "}
                    {exp.dangLamViec
                      ? "Hiện tại"
                      : `${exp.thoiGianKetThuc?.thang || "N/A"}/${exp.thoiGianKetThuc?.nam || "N/A"}`}
                  </span>
                  <Button
                    type="link"
                    onClick={() => handleEditWorkExperience(index)}
                    style={{ marginLeft: 10 }}
                  >
                    Chỉnh sửa
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Form form={form4} layout="vertical" onFinish={() => setCurrentStep(4)}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tiếp theo
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  const renderStep5 = () => {
    const handleCheckboxChange = (type, index, checked) => {
      if (type === "soft") {
        setSoftSkills((prev) =>
          prev.map((skill, i) => (i === index ? { ...skill, checked } : skill))
        );
      } else {
        setProfessionalSkills((prev) =>
          prev.map((skill, i) => (i === index ? { ...skill, checked } : skill))
        );
      }
    };

    const handleRatingChange = (type, index, value) => {
      if (type === "soft") {
        setSoftSkills((prev) =>
          prev.map((skill, i) =>
            i === index ? { ...skill, rating: value } : skill
          )
        );
      } else {
        setProfessionalSkills((prev) =>
          prev.map((skill, i) =>
            i === index ? { ...skill, rating: value } : skill
          )
        );
      }
    };

    const handleNameChange = (index, value) => {
      setProfessionalSkills((prev) =>
        prev.map((skill, i) =>
          i === index ? { ...skill, name: value } : skill
        )
      );
    };

    const handleAddSkill = () => {
      setProfessionalSkills((prev) => [
        ...prev,
        { name: "", checked: false, rating: 3, description: "" },
      ]);
    };

    console.log("softSkills trước khi render:", softSkills);
    console.log("professionalSkills trước khi render:", professionalSkills);

    return (
      <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
        <Steps
          size="small"
          current={4}
          onChange={onChangeStep}
          style={{ marginBottom: 20 }}
        >
          <Step icon={<UserOutlined />} title="Thông tin cá nhân" />
          <Step icon={<ProfileOutlined />} title="Thông tin hồ sơ" />
          <Step icon={<ReadOutlined />} title="Học vấn bằng cấp" />
          <Step icon={<ToolOutlined />} title="Kinh nghiệm làm việc" />
          <Step icon={<BulbOutlined />} title="Kỹ năng" />
          <Step icon={<GlobalOutlined />} title="Tin học - Ngoại ngữ" />
        </Steps>

        <h3 style={{ marginBottom: 15 }}>Kỹ năng</h3>
        <Form form={form5} layout="vertical" onFinish={onFinishStep5}>
          <h4 style={{ fontWeight: "bold", marginBottom: 10 }}>Kỹ năng mềm</h4>
          {Array.isArray(softSkills) && softSkills.length > 0 ? (
            softSkills.map((skill, index) => {
              if (!skill || typeof skill !== "object" || !skill.name) {
                console.error(`Invalid softSkill at index ${index}:`, skill);
                return null;
              }
              return (
                <div
                  key={index}
                  style={{
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    checked={skill.checked === true}
                    onChange={(e) =>
                      handleCheckboxChange("soft", index, e.target.checked)
                    }
                    style={{ marginRight: 10 }}
                  />
                  <span style={{ width: 250, marginRight: 10 }}>
                    {typeof skill.name === "string"
                      ? skill.name
                      : "Kỹ năng không xác định"}
                  </span>
                  <Rate
                    value={Number(skill.rating) || 0}
                    onChange={(value) =>
                      handleRatingChange("soft", index, value)
                    }
                  />
                </div>
              );
            })
          ) : (
            <p>Không có kỹ năng mềm nào để hiển thị.</p>
          )}

          <h4 style={{ fontWeight: "bold", marginTop: 20, marginBottom: 10 }}>
            Kỹ năng chuyên môn
          </h4>
          {Array.isArray(professionalSkills) &&
          professionalSkills.length > 0 ? (
            professionalSkills.map((skill, index) => {
              if (!skill || typeof skill !== "object") {
                console.error(
                  `Invalid professionalSkill at index ${index}:`,
                  skill
                );
                return null;
              }
              return (
                <div
                  key={index}
                  style={{
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    checked={skill.checked === true}
                    onChange={(e) =>
                      handleCheckboxChange(
                        "professional",
                        index,
                        e.target.checked
                      )
                    }
                    style={{ marginRight: 10 }}
                  />
                  <Input
                    value={typeof skill.name === "string" ? skill.name : ""}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder="Nhập tên kỹ năng"
                    style={{ width: 200, marginRight: 10 }}
                    disabled={!skill.checked}
                  />
                  <Rate
                    value={Number(skill.rating) || 0}
                    onChange={(value) =>
                      handleRatingChange("professional", index, value)
                    }
                    disabled={!skill.checked}
                  />
                </div>
              );
            })
          ) : (
            <p>Không có kỹ năng chuyên môn nào để hiển thị.</p>
          )}

          <Button
            type="primary"
            onClick={handleAddSkill}
            style={{ marginTop: 10, marginBottom: 20 }}
          >
            Thêm kỹ năng
          </Button>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tiếp theo
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  const renderStep6 = () => {
    const handleITSkillChange = (index, proficiency) => {
      setITSkills((prev) =>
        prev.map((skill, i) =>
          i === index ? { ...skill, proficiency } : skill
        )
      );
    };

    const handleLanguageChange = (index, skill, value) => {
      setLanguages((prev) =>
        prev.map((lang, i) =>
          i === index ? { ...lang, [skill]: value } : lang
        )
      );
    };

    return (
      <div style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
        <Steps
          size="small"
          current={5}
          onChange={onChangeStep}
          style={{ marginBottom: 20 }}
        >
          <Step icon={<UserOutlined />} title="Thông tin cá nhân" />
          <Step icon={<ProfileOutlined />} title="Thông tin hồ sơ" />
          <Step icon={<ReadOutlined />} title="Học vấn bằng cấp" />
          <Step icon={<ToolOutlined />} title="Kinh nghiệm làm việc" />
          <Step icon={<BulbOutlined />} title="Kỹ năng" />
          <Step icon={<GlobalOutlined />} title="Tin học - Ngoại ngữ" />
        </Steps>

        <h3 style={{ marginBottom: 15 }}>Tin học - Ngoại ngữ</h3>
        <Row gutter={16}>
          <Col span={12}>
            <h4>Ngoại ngữ</h4>
            <Button
              type="primary"
              onClick={() => setIsLanguageModalVisible(true)}
              style={{ marginBottom: 15 }}
            >
              + Thêm ngoại ngữ
            </Button>
            {languages.map((lang, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <span>{lang.name}</span>
                <div style={{ marginLeft: 10 }}>
                  <p>
                    Nghe:
                    <Radio.Group
                      value={lang.listening}
                      onChange={(e) =>
                        handleLanguageChange(index, "listening", e.target.value)
                      }
                      style={{ marginLeft: 5 }}
                    >
                      <Radio value="Tốt">Tốt</Radio>
                      <Radio value="Khá">Khá</Radio>
                      <Radio value="Trung bình">Trung bình</Radio>
                      <Radio value="Yếu">Yếu</Radio>
                    </Radio.Group>
                  </p>
                  <p>
                    Nói:
                    <Radio.Group
                      value={lang.speaking}
                      onChange={(e) =>
                        handleLanguageChange(index, "speaking", e.target.value)
                      }
                      style={{ marginLeft: 5 }}
                    >
                      <Radio value="Tốt">Tốt</Radio>
                      <Radio value="Khá">Khá</Radio>
                      <Radio value="Trung bình">Trung bình</Radio>
                      <Radio value="Yếu">Yếu</Radio>
                    </Radio.Group>
                  </p>
                  <p>
                    Viết:
                    <Radio.Group
                      value={lang.writing}
                      onChange={(e) =>
                        handleLanguageChange(index, "writing", e.target.value)
                      }
                      style={{ marginLeft: 5 }}
                    >
                      <Radio value="Tốt">Tốt</Radio>
                      <Radio value="Khá">Khá</Radio>
                      <Radio value="Trung bình">Trung bình</Radio>
                      <Radio value="Yếu">Yếu</Radio>
                    </Radio.Group>
                  </p>
                  <p>
                    Đọc:
                    <Radio.Group
                      value={lang.reading}
                      onChange={(e) =>
                        handleLanguageChange(index, "reading", e.target.value)
                      }
                      style={{ marginLeft: 5 }}
                    >
                      <Radio value="Tốt">Tốt</Radio>
                      <Radio value="Khá">Khá</Radio>
                      <Radio value="Trung bình">Trung bình</Radio>
                      <Radio value="Yếu">Yếu</Radio>
                    </Radio.Group>
                  </p>
                </div>
              </div>
            ))}
          </Col>
          <Col span={12}>
            <h4>Tin học</h4>
            {itSkills.map((skill, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <span>{skill.name}</span>
                <Radio.Group
                  value={skill.proficiency}
                  onChange={(e) => handleITSkillChange(index, e.target.value)}
                  style={{ marginLeft: 10 }}
                >
                  <Radio value="Tốt">Tốt</Radio>
                  <Radio value="Khá">Khá</Radio>
                  <Radio value="Trung bình">Trung bình</Radio>
                  <Radio value="Kém">Kém</Radio>
                </Radio.Group>
              </div>
            ))}
          </Col>
        </Row>
        <Form form={form6} layout="vertical" onFinish={onFinishStep6}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Hoàn Thành
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  };

  const EducationModal = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [previewImage, setPreviewImage] = useState("");

    useEffect(() => {
      form.setFieldsValue(educationData);
      if (educationData.imageUrl) {
        setFileList([
          {
            uid: "-1",
            name: "certificate.png",
            status: "done",
            url: educationData.imageUrl,
          },
        ]);
        setPreviewImage(educationData.imageUrl);
      } else {
        setFileList([]);
        setPreviewImage("");
      }
    }, [educationData, form]);

    const onFinish = (values) => {
      const updatedEducation = {
        ...values,
        thoiGianBatDau: {
          thang:
            values.thoiGianBatDau?.thang || educationData.thoiGianBatDau.thang,
          nam: values.thoiGianBatDau?.nam || educationData.thoiGianBatDau.nam,
        },
        thoiGianKetThuc: {
          thang:
            values.thoiGianKetThuc?.thang ||
            educationData.thoiGianKetThuc.thang,
          nam: values.thoiGianKetThuc?.nam || educationData.thoiGianKetThuc.nam,
        },
        xepLoai: values.xepLoai || "Khá",
        imageUrl: educationData.imageUrl || "",
      };

      if (editingEducationIndex !== null) {
        const updatedList = [...educationList];
        updatedList[editingEducationIndex] = updatedEducation;
        setEducationList(updatedList);
        setCvData((prev) => ({ ...prev, educationList: updatedList }));
      } else {
        setEducationList([...educationList, updatedEducation]);
        setCvData((prev) => ({
          ...prev,
          educationList: [...educationList, updatedEducation],
        }));
      }

      setEducationData({
        tenBangCap: "",
        donViDaoTao: "",
        thoiGianBatDau: { thang: "01", nam: "2020" },
        thoiGianKetThuc: { thang: "12", nam: "2023" },
        xepLoai: "Khá",
        imageUrl: "",
      });
      setFileList([]);
      setPreviewImage("");
      setEditingEducationIndex(null);
      onCancel();
    };

    const handleUpload = async ({ file }) => {
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "uploading",
          url: previewUrl,
        },
      ]);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "education");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("Bạn chưa đăng nhập!");
          return;
        }
        const response = await axios.post(
          "http://localhost:5000/api/upload-image",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const imageUrl = response.data.url;
        if (!imageUrl || typeof imageUrl !== "string") {
          throw new Error("Không tìm thấy URL hợp lệ trong response");
        }

        setEducationData((prev) => ({ ...prev, imageUrl }));
        setFileList([
          {
            uid: "-1",
            name: file.name,
            status: "done",
            url: imageUrl,
          },
        ]);
        setPreviewImage(imageUrl);
        message.success("Upload ảnh thành công!");
      } catch (error) {
        console.error("Upload error:", error);
        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: "error",
            url: previewUrl,
          },
        ]);
        setPreviewImage(previewUrl);
        message.error("Không thể upload ảnh!");
      }
    };

    const handleRemove = () => {
      setEducationData((prev) => ({ ...prev, imageUrl: "" }));
      setFileList([]);
      setPreviewImage("");
    };

    return (
      <Modal
        title={
          editingEducationIndex !== null
            ? "Chỉnh sửa học vấn"
            : "Cập nhật học vấn"
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên bằng cấp"
            name="tenBangCap"
            rules={[{ required: true, message: "Vui lòng nhập tên bằng cấp!" }]}
          >
            <Input placeholder="VD: Cử nhân CNTT" />
          </Form.Item>
          <Form.Item
            label="Đơn vị đào tạo"
            name="donViDaoTao"
            rules={[
              { required: true, message: "Vui lòng nhập đơn vị đào tạo!" },
            ]}
          >
            <Input placeholder="VD: Đại học Bách Khoa" />
          </Form.Item>
          <Form.Item label="Thời gian bắt đầu" required>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["thoiGianBatDau", "thang"]}
                  rules={[{ required: true, message: "Chọn tháng!" }]}
                  initialValue={educationData.thoiGianBatDau.thang}
                >
                  <Select placeholder="Tháng">
                    {Array.from({ length: 12 }, (_, i) => (
                      <Option
                        key={i + 1}
                        value={String(i + 1).padStart(2, "0")}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["thoiGianBatDau", "nam"]}
                  rules={[{ required: true, message: "Chọn năm!" }]}
                  initialValue={educationData.thoiGianBatDau.nam}
                >
                  <Select placeholder="Năm">
                    {Array.from({ length: 20 }, (_, i) => (
                      <Option key={2020 + i} value={String(2020 + i)}>
                        {2020 + i}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item label="Thời gian kết thúc" required>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["thoiGianKetThuc", "thang"]}
                  rules={[{ required: true, message: "Chọn tháng!" }]}
                  initialValue={educationData.thoiGianKetThuc.thang}
                >
                  <Select placeholder="Tháng">
                    {Array.from({ length: 12 }, (_, i) => (
                      <Option
                        key={i + 1}
                        value={String(i + 1).padStart(2, "0")}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["thoiGianKetThuc", "nam"]}
                  rules={[{ required: true, message: "Chọn năm!" }]}
                  initialValue={educationData.thoiGianKetThuc.nam}
                >
                  <Select placeholder="Năm">
                    {Array.from({ length: 20 }, (_, i) => (
                      <Option key={2020 + i} value={String(2020 + i)}>
                        {2020 + i}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item
            label="Xếp loại"
            name="xepLoai"
            rules={[{ required: true, message: "Vui lòng chọn xếp loại!" }]}
          >
            <Select placeholder="Chọn xếp loại">
              <Option value="Xuất sắc">Xuất sắc</Option>
              <Option value="Giỏi">Giỏi</Option>
              <Option value="Khá">Khá</Option>
              <Option value="Trung bình">Trung bình</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Upload ảnh văn bằng">
            <Upload
              fileList={fileList}
              customRequest={handleUpload}
              onRemove={handleRemove}
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload ảnh</Button>
            </Upload>
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                style={{ maxWidth: "100%", marginTop: 10 }}
                onError={() =>
                  console.error("Failed to load image:", previewImage)
                }
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingEducationIndex !== null ? "Cập nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const WorkExperienceModal = ({ visible, onCancel }) => {
    const [form] = Form.useForm();

    useEffect(() => {
      form.setFieldsValue(currentWorkExperience);
    }, [currentWorkExperience, form]);

    const onFinish = (values) => {
      const newExperience = {
        ...values,
        thoiGianBatDau: {
          thang: values.thoiGianBatDau?.thang || "01",
          nam: values.thoiGianBatDau?.nam || "2020",
        },
        thoiGianKetThuc: values.dangLamViec
          ? null
          : {
              thang: values.thoiGianKetThuc?.thang || "12",
              nam: values.thoiGianKetThuc?.nam || "2023",
            },
      };

      if (editingWorkExperienceIndex !== null) {
        const updatedList = [...(cvData.kinhNghiemList || [])];
        updatedList[editingWorkExperienceIndex] = newExperience;
        setCvData((prev) => ({ ...prev, kinhNghiemList: updatedList }));
      } else {
        setCvData((prev) => ({
          ...prev,
          kinhNghiemList: [...(prev.kinhNghiemList || []), newExperience],
        }));
      }

      setCurrentWorkExperience({
        tenCongTy: "",
        chucDanh: "",
        thoiGianBatDau: { thang: "01", nam: "2020" },
        thoiGianKetThuc: { thang: "12", nam: "2023" },
        dangLamViec: false,
        moTa: "",
      });
      setEditingWorkExperienceIndex(null);
      onCancel();
    };

    return (
      <Modal
        title={
          editingWorkExperienceIndex !== null
            ? "Chỉnh sửa kinh nghiệm"
            : "Thêm kinh nghiệm"
        }
        open={visible}
        onCancel={onCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên công ty"
            name="tenCongTy"
            rules={[{ required: true, message: "Vui lòng nhập tên công ty!" }]}
          >
            <Input placeholder="VD: Công ty ABC" />
          </Form.Item>
          <Form.Item
            label="Chức danh"
            name="chucDanh"
            rules={[{ required: true, message: "Vui lòng nhập chức danh!" }]}
          >
            <Input placeholder="VD: Nhân viên IT" />
          </Form.Item>
          <Form.Item label="Thời gian bắt đầu" required>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["thoiGianBatDau", "thang"]}
                  rules={[{ required: true, message: "Chọn tháng!" }]}
                  initialValue={currentWorkExperience.thoiGianBatDau.thang}
                >
                  <Select placeholder="Tháng">
                    {Array.from({ length: 12 }, (_, i) => (
                      <Option
                        key={i + 1}
                        value={String(i + 1).padStart(2, "0")}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["thoiGianBatDau", "nam"]}
                  rules={[{ required: true, message: "Chọn năm!" }]}
                  initialValue={currentWorkExperience.thoiGianBatDau.nam}
                >
                  <Select placeholder="Năm">
                    {Array.from({ length: 20 }, (_, i) => (
                      <Option key={2020 + i} value={String(2020 + i)}>
                        {2020 + i}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item
            label="Thời gian kết thúc"
            required={!form.getFieldValue("dangLamViec")}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={["thoiGianKetThuc", "thang"]}
                  rules={[
                    {
                      required: !form.getFieldValue("dangLamViec"),
                      message: "Chọn tháng!",
                    },
                  ]}
                  initialValue={currentWorkExperience.thoiGianKetThuc?.thang}
                >
                  <Select
                    placeholder="Tháng"
                    disabled={form.getFieldValue("dangLamViec")}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <Option
                        key={i + 1}
                        value={String(i + 1).padStart(2, "0")}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={["thoiGianKetThuc", "nam"]}
                  rules={[
                    {
                      required: !form.getFieldValue("dangLamViec"),
                      message: "Chọn năm!",
                    },
                  ]}
                  initialValue={currentWorkExperience.thoiGianKetThuc?.nam}
                >
                  <Select
                    placeholder="Năm"
                    disabled={form.getFieldValue("dangLamViec")}
                  >
                    {Array.from({ length: 20 }, (_, i) => (
                      <Option key={2020 + i} value={String(2020 + i)}>
                        {2020 + i}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item name="dangLamViec" valuePropName="checked">
            <Checkbox
              onChange={(e) => {
                form.setFieldsValue({
                  thoiGianKetThuc: e.target.checked
                    ? null
                    : currentWorkExperience.thoiGianKetThuc,
                });
              }}
            >
              Tôi vẫn đang làm việc tại đây
            </Checkbox>
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="moTa"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <TextArea rows={4} placeholder="Mô tả công việc, thành tựu..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingWorkExperienceIndex !== null ? "Cập nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const LanguageModal = ({ visible, onCancel }) => {
    const [form] = Form.useForm();

    useEffect(() => {
      form.setFieldsValue(newLanguage);
    }, [newLanguage, form]);

    const onFinish = (values) => {
      setLanguages([...languages, values]);
      setCvData((prev) => ({ ...prev, languages: [...languages, values] }));
      setNewLanguage({
        name: "",
        listening: "Khá",
        speaking: "Khá",
        writing: "Khá",
        reading: "Khá",
      });
      onCancel();
    };

    return (
      <Modal
        title="Thêm ngoại ngữ"
        open={visible}
        onCancel={onCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Ngoại ngữ"
            name="name"
            rules={[{ required: true, message: "Vui lòng chọn ngoại ngữ!" }]}
          >
            <Select placeholder="Chọn ngoại ngữ">
              <Option value="Tiếng Anh">Tiếng Anh</Option>
              <Option value="Tiếng Nhật">Tiếng Nhật</Option>
              <Option value="Tiếng Trung">Tiếng Trung</Option>
              <Option value="Tiếng Pháp">Tiếng Pháp</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Nghe"
            name="listening"
            rules={[
              { required: true, message: "Vui lòng chọn trình độ nghe!" },
            ]}
          >
            <Radio.Group>
              <Radio value="Tốt">Tốt</Radio>
              <Radio value="Khá">Khá</Radio>
              <Radio value="Trung bình">Trung bình</Radio>
              <Radio value="Yếu">Yếu</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Nói"
            name="speaking"
            rules={[{ required: true, message: "Vui lòng chọn trình độ nói!" }]}
          >
            <Radio.Group>
              <Radio value="Tốt">Tốt</Radio>
              <Radio value="Khá">Khá</Radio>
              <Radio value="Trung bình">Trung bình</Radio>
              <Radio value="Yếu">Yếu</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Viết"
            name="writing"
            rules={[
              { required: true, message: "Vui lòng chọn trình độ viết!" },
            ]}
          >
            <Radio.Group>
              <Radio value="Tốt">Tốt</Radio>
              <Radio value="Khá">Khá</Radio>
              <Radio value="Trung bình">Trung bình</Radio>
              <Radio value="Yếu">Yếu</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Đọc"
            name="reading"
            rules={[{ required: true, message: "Vui lòng chọn trình độ đọc!" }]}
          >
            <Radio.Group>
              <Radio value="Tốt">Tốt</Radio>
              <Radio value="Khá">Khá</Radio>
              <Radio value="Trung bình">Trung bình</Radio>
              <Radio value="Yếu">Yếu</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const renderStepContent = () => (
    <>
      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}
      {currentStep === 3 && renderStep4()}
      {currentStep === 4 && renderStep5()}
      {currentStep === 5 && renderStep6()}
      <EducationModal
        visible={isEducationModalVisible}
        onCancel={() => setIsEducationModalVisible(false)}
      />
      <WorkExperienceModal
        visible={isWorkExperienceModalVisible}
        onCancel={() => setIsWorkExperienceModalVisible(false)}
      />
      <LanguageModal
        visible={isLanguageModalVisible}
        onCancel={() => setIsLanguageModalVisible(false)}
      />
    </>
  );

  return <>{renderStepContent()}</>;
};

export default UserUpdatePage;
