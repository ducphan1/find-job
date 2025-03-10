import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Input, Button, DatePicker, Select, message } from "antd";
import { useNavigate } from "react-router-dom";
import {
  FileTextOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  DollarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import moment from "moment";
import { locations } from "../../../data/locations.js";
import { jobCategories } from "../../../data/job.js";
import "../../../styles/EmployerDashboardPage.css";

message.config({
  top: 20,
  duration: 3,
  maxCount: 1,
});

const { Option } = Select;

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const EmployerJobsPage = () => {
  const [form] = Form.useForm();
  const [company, setCompany] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [socket, setSocket] = useState(null); // State cho Socket.IO
  const navigate = useNavigate();

  // State cho các trường nhập liệu dạng HTML
  const [jobDescription, setJobDescription] = useState("");
  const [requirement, setRequirement] = useState("");
  const [benefit, setBenefit] = useState("");
  const [profile, setProfile] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Vui lòng đăng nhập trước khi đăng tin!");
      navigate("/employer/login");
      return;
    }

    // Thiết lập Socket.IO
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
    });
    setSocket(newSocket);

    // Lắng nghe sự kiện từ server
    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("notification", (data) => {
      if (data.type === "job_created") {
        message.success(`Thông báo: ${data.message}`);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    const fetchCompany = async () => {
      try {
        const response = await axios.get("/api/companies/my-company", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompany(response.data);
      } catch (error) {
        console.error(
          "Lỗi fetch company:",
          error.response?.data || error.message
        );
        if (error.response?.status === 404) {
          message.error("Bạn chưa có công ty, vui lòng liên hệ quản trị viên!");
        } else {
          message.error("Không thể tải thông tin công ty!");
        }
      }
    };
    fetchCompany();

    // Dọn dẹp khi component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    setSelectedDistrict(null);
    form.setFieldsValue({ district: null, ward: null });
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    form.setFieldsValue({ ward: null });
  };

  const onFinish = async (values) => {
    if (!company) {
      message.error("Không tìm thấy công ty của bạn!");
      return;
    }

    try {
      const locationString = `${values.province}, ${values.district}, ${values.ward}`;

      const jobData = {
        company: company._id,
        title: values.jobTitle,
        description: jobDescription,
        location: `${locationString}, ${address}`,
        category: values.category,
        level: values.level,
        salary: values.salary,
        date: values.postedDate.unix(),
        visible: true,
        experience: values.experience,
        education: values.education,
        quantity: values.quantity,
        position: values.position,
        workTime: values.workTime,
        deadline: values.deadline.unix(),
        requirement: requirement,
        benefit: benefit,
        profile: profile,
        contact: {
          name: values.contactName,
          phone: values.contactPhone || "",
          email: values.contactEmail,
        },
      };

      console.log("Sending job data:", jobData);

      const response = await axios.post("/api/jobs", jobData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      message.success("Tin tuyển dụng đã được đăng thành công!");
      if (socket) {
        socket.emit("job_created", {
          jobId: response.data._id,
          data: jobData,
        });
      }

      form.resetFields();
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setJobDescription("");
      setRequirement("");
      setBenefit("");
      setProfile("");
      setAddress("");
      navigate("/employer/job-management");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Đã xảy ra lỗi khi đăng tin tuyển dụng!";
      message.error(errorMsg);
      console.error("Lỗi gửi dữ liệu:", error.response?.data || error.message);
    }
  };

  return (
    <div className="employer-jobs-page">
      <h2 className="job-page-title">Đăng Tin Tuyển Dụng</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ postedDate: moment() }}
        className="job-form"
      >
        {/* Thông tin công ty */}
        <Form.Item label="Công ty">
          <Input
            value={company ? company.name : "Đang tải..."}
            disabled
            placeholder="Tên công ty của bạn"
          />
        </Form.Item>

        {/* Tên công việc */}
        <Form.Item
          label={
            <>
              <FileTextOutlined /> Tên công việc
            </>
          }
          name="jobTitle"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề công việc" },
          ]}
        >
          <Input placeholder="Nhập tiêu đề công việc" />
        </Form.Item>

        {/* Mô tả công việc */}
        <Form.Item
          label={
            <>
              <InfoCircleOutlined /> Mô tả công việc
            </>
          }
        >
          <ReactQuill
            theme="snow"
            value={jobDescription}
            onChange={setJobDescription}
          />
        </Form.Item>

        {/* Mức lương */}
        <Form.Item
          label={
            <>
              <DollarOutlined /> Mức lương
            </>
          }
          name="salary"
          rules={[{ required: true, message: "Vui lòng chọn mức lương" }]}
        >
          <Select placeholder="Chọn mức lương">
            <Option value="Thỏa thuận">Thỏa thuận</Option>
            <Option value="Dưới 3 triệu">Dưới 3 triệu</Option>
            <Option value="3 - 5 triệu">3 - 5 triệu</Option>
            <Option value="5 - 7 triệu">5 - 7 triệu</Option>
            <Option value="7 - 10 triệu">7 - 10 triệu</Option>
            <Option value="10 - 12 triệu">10 - 12 triệu</Option>
            <Option value="12 - 15 triệu">12 - 15 triệu</Option>
            <Option value="15 - 20 triệu">15 - 20 triệu</Option>
            <Option value="20 - 25 triệu">20 - 25 triệu</Option>
            <Option value="25 - 30 triệu">25 - 30 triệu</Option>
            <Option value="Trên 30 triệu">Trên 30 triệu</Option>
          </Select>
        </Form.Item>

        {/* Cấp bậc */}
        <Form.Item
          label={
            <>
              <GlobalOutlined /> Cấp bậc
            </>
          }
          name="level"
          rules={[{ required: true, message: "Vui lòng chọn cấp bậc" }]}
        >
          <Select placeholder="Chọn cấp bậc">
            <Option value="Nhân viên/ Chuyên viên">
              Nhân viên/ Chuyên viên
            </Option>
            <Option value="Sinh viên/ Thực tập sinh">
              Sinh viên/ Thực tập sinh
            </Option>
            <Option value="Trưởng nhóm/ Giám sát">Trưởng nhóm/ Giám sát</Option>
            <Option value="Quản lý">Quản lý</Option>
            <Option value="Điều hành cấp cao">Điều hành cấp cao</Option>
          </Select>
        </Form.Item>

        {/* Loại hình làm việc */}
        <Form.Item
          label="Loại hình làm việc"
          name="workTime"
          rules={[
            { required: true, message: "Vui lòng chọn loại hình làm việc" },
          ]}
        >
          <Select placeholder="Chọn loại hình">
            <Option value="Toàn thời gian">Toàn thời gian</Option>
            <Option value="Bán thời gian/ Thời vụ">
              Bán thời gian/ Thời vụ
            </Option>
            <Option value="Thực tập">Thực tập</Option>
            <Option value="Remote - Làm việc từ xa">
              Remote - Làm việc từ xa
            </Option>
            <Option value="Khác">Khác</Option>
          </Select>
        </Form.Item>

        {/* Kinh nghiệm */}
        <Form.Item
          label="Kinh nghiệm"
          name="experience"
          rules={[{ required: true, message: "Vui lòng chọn kinh nghiệm" }]}
        >
          <Select placeholder="Chọn kinh nghiệm">
            <Option value="Không yêu cầu">Không yêu cầu</Option>
            <Option value="Dưới 1 năm">Dưới 1 năm</Option>
            <Option value="1 năm">1 năm</Option>
            <Option value="2 năm">2 năm</Option>
            <Option value="3 năm">3 năm</Option>
            <Option value="4 năm">4 năm</Option>
            <Option value="5 năm">5 năm</Option>
            <Option value="Trên 5 năm">Trên 5 năm</Option>
          </Select>
        </Form.Item>

        {/* Trình độ */}
        <Form.Item
          label="Trình độ"
          name="education"
          rules={[{ required: true, message: "Vui lòng chọn trình độ" }]}
        >
          <Select placeholder="Chọn trình độ">
            <Option value="Không yêu cầu">Không yêu cầu</Option>
            <Option value="Trên đại học">Trên đại học</Option>
            <Option value="Đại học">Đại học</Option>
            <Option value="Cao đẳng">Cao đẳng</Option>
            <Option value="Trung cấp">Trung cấp</Option>
            <Option value="Chứng chỉ nghề">Chứng chỉ nghề</Option>
            <Option value="Phổ thông">Phổ thông</Option>
          </Select>
        </Form.Item>

        {/* Số lượng cần tuyển */}
        <Form.Item
          label="Số lượng cần tuyển"
          name="quantity"
          rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
        >
          <Input type="number" placeholder="VD: 5" />
        </Form.Item>

        {/* Chức vụ */}
        <Form.Item
          label="Chức vụ"
          name="position"
          rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
        >
          <Input placeholder="VD: Nhân viên, Quản lý..." />
        </Form.Item>

        {/* Hạn nộp hồ sơ */}
        <Form.Item
          label={
            <>
              <CalendarOutlined /> Hạn nộp hồ sơ
            </>
          }
          name="deadline"
          rules={[{ required: true, message: "Vui lòng chọn hạn nộp hồ sơ" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>

        {/* Yêu cầu công việc */}
        <Form.Item label="Yêu cầu công việc">
          <ReactQuill
            theme="snow"
            value={requirement}
            onChange={setRequirement}
          />
        </Form.Item>

        {/* Quyền lợi được hưởng */}
        <Form.Item label="Quyền lợi được hưởng">
          <ReactQuill theme="snow" value={benefit} onChange={setBenefit} />
        </Form.Item>

        {/* Yêu cầu hồ sơ */}
        <Form.Item label="Yêu cầu hồ sơ">
          <ReactQuill theme="snow" value={profile} onChange={setProfile} />
        </Form.Item>

        {/* Người liên hệ */}
        <Form.Item
          label="Người liên hệ"
          name="contactName"
          rules={[
            { required: true, message: "Vui lòng nhập tên người liên hệ" },
          ]}
        >
          <Input placeholder="VD: Phòng Nhân Sự" />
        </Form.Item>

        {/* SĐT liên hệ */}
        <Form.Item
          label="SĐT liên hệ"
          name="contactPhone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input placeholder="VD: 0916926436" />
        </Form.Item>

        {/* Email liên hệ */}
        <Form.Item
          label="Email liên hệ"
          name="contactEmail"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="VD: nhansu@company.com" />
        </Form.Item>

        {/* Tỉnh/Thành phố */}
        <Form.Item
          label={
            <>
              <EnvironmentOutlined /> Tỉnh/Thành phố
            </>
          }
          name="province"
          rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
        >
          <Select
            placeholder="Chọn tỉnh/thành phố"
            onChange={handleProvinceChange}
          >
            {locations.provinces.map((province) => (
              <Option key={province.code} value={province.name}>
                {province.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Quận/Huyện */}
        <Form.Item
          label={
            <>
              <EnvironmentOutlined /> Quận/Huyện
            </>
          }
          name="district"
          rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
        >
          <Select
            placeholder="Chọn quận/huyện"
            onChange={handleDistrictChange}
            disabled={!selectedProvince}
          >
            {selectedProvince &&
              locations.provinces
                .find((p) => p.name === selectedProvince)
                ?.districts.map((district) => (
                  <Option key={district.code} value={district.name}>
                    {district.name}
                  </Option>
                ))}
          </Select>
        </Form.Item>

        {/* Phường/Xã */}
        <Form.Item
          label={
            <>
              <EnvironmentOutlined /> Phường/Xã
            </>
          }
          name="ward"
          rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
        >
          <Select placeholder="Chọn phường/xã" disabled={!selectedDistrict}>
            {selectedDistrict &&
              locations.provinces
                .find((p) => p.name === selectedProvince)
                ?.districts.find((d) => d.name === selectedDistrict)
                ?.wards.map((ward) => (
                  <Option key={ward.name || ward} value={ward.name || ward}>
                    {ward.name || ward}
                  </Option>
                ))}
          </Select>
        </Form.Item>

        {/* Địa chỉ chi tiết */}
        <Form.Item label="Địa chỉ chi tiết">
          <ReactQuill theme="snow" value={address} onChange={setAddress} />
        </Form.Item>

        {/* Danh mục công việc */}
        <Form.Item
          label={
            <>
              <GlobalOutlined /> Danh mục công việc
            </>
          }
          name="category"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <Select placeholder="Chọn danh mục" showSearch>
            {jobCategories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Ngày đăng tuyển */}
        <Form.Item
          label={
            <>
              <CalendarOutlined /> Ngày đăng tuyển
            </>
          }
          name="postedDate"
          rules={[{ required: true, message: "Vui lòng chọn ngày đăng tuyển" }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Đăng tin tuyển dụng
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EmployerJobsPage;
