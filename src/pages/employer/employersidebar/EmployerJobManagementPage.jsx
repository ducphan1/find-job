import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
} from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { PlusOutlined } from "@ant-design/icons";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "../../../styles/EmployerDashboardPage.css";

message.config({
  top: 20,
  duration: 3,
  maxCount: 1,
});

const { Option } = Select;

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

const getSalaryLabel = (salaryNum) => {
  if (!salaryNum || salaryNum === -1) return "Thỏa thuận";
  if (salaryNum <= 3000000) return "Dưới 3 triệu";
  if (salaryNum <= 5000000) return "3 - 5 triệu";
  if (salaryNum <= 7000000) return "5 - 7 triệu";
  if (salaryNum <= 10000000) return "7 - 10 triệu";
  if (salaryNum <= 12000000) return "10 - 12 triệu";
  if (salaryNum <= 15000000) return "12 - 15 triệu";
  if (salaryNum <= 20000000) return "15 - 20 triệu";
  if (salaryNum <= 25000000) return "20 - 25 triệu";
  if (salaryNum <= 30000000) return "25 - 30 triệu";
  return "Trên 30 triệu";
};

const EmployerJobManagementPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form] = Form.useForm();
  const [descriptionValue, setDescriptionValue] = useState("");
  const [requirementValue, setRequirementValue] = useState("");
  const [benefitValue, setBenefitValue] = useState("");
  const [profileValue, setProfileValue] = useState("");
  const [addressValue, setAddressValue] = useState("");
  const [socket, setSocket] = useState(null); // State cho Socket.IO
  const navigate = useNavigate();

  // Khởi tạo Socket.IO và lấy danh sách jobs
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Vui lòng đăng nhập trước!");
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
      if (
        data.type === "job_updated" ||
        data.type === "job_deleted" ||
        data.type === "job_created"
      ) {
        message.info(`Thông báo: ${data.message}`);
        fetchJobs(); // Tải lại danh sách jobs khi có thay đổi
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/jobs/my-jobs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const normalizedJobs =
          response.data && Array.isArray(response.data)
            ? response.data.map((job) => ({
                ...job,
                salary: job.salary ?? -1,
                date: job.date ?? Date.now() / 1000,
                _id:
                  job._id || `temp_${Math.random().toString(36).substr(2, 9)}`,
              }))
            : [];
        setJobs(normalizedJobs);
        message.success("Danh sách tin tuyển dụng đã được tải thành công!");
      } catch (error) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Không thể tải danh sách tin tuyển dụng!";
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();

    // Dọn dẹp khi component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  const handleDelete = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(jobs.filter((job) => job._id !== jobId));
      message.success("Đã xóa tin tuyển dụng thành công!");
      // Gửi sự kiện qua socket nếu cần (tùy backend)
      if (socket) {
        socket.emit("job_deleted", { jobId });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Lỗi khi xóa tin tuyển dụng!";
      message.error(errorMsg);
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setDescriptionValue(job.description || "");
    setRequirementValue(job.requirement || "");
    setBenefitValue(job.benefit || "");
    setProfileValue(job.profile || "");
    setAddressValue(job.address || "");

    const deadlineMoment = job.deadline ? moment.unix(job.deadline) : null;

    form.setFieldsValue({
      jobTitle: job.title,
      jobDescription: job.description,
      location: job.location || "",
      address: job.address || "",
      category: job.category,
      level: job.level,
      salary: getSalaryLabel(job.salary),
      postedDate: moment.unix(job.date),
      experience: job.experience || "",
      education: job.education || "",
      quantity: job.quantity || "",
      position: job.position || "",
      workTime: job.workTime || "",
      deadline: deadlineMoment,
      contactPhone: job.contact?.phone || "",
      contactName: job.contact?.name || "",
      contactEmail: job.contact?.email || "",
      requirement: job.requirement || "",
      benefit: job.benefit || "",
      profile: job.profile || "",
    });
    setIsModalVisible(true);
    message.info("Đang mở form chỉnh sửa tin tuyển dụng.");
  };

  const handleCancel = (isCancelledByUser = false) => {
    setIsModalVisible(false);
    setSelectedJob(null);
    setDescriptionValue("");
    setRequirementValue("");
    setBenefitValue("");
    setProfileValue("");
    setAddressValue("");
    form.resetFields();
    if (isCancelledByUser) {
      message.info("Đã hủy chỉnh sửa tin tuyển dụng.");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("token");

      const jobData = {
        company: selectedJob.company,
        title: values.jobTitle,
        description: descriptionValue,
        location: values.location,
        address: addressValue,
        category: values.category,
        level: values.level,
        salary: values.salary,
        date: values.postedDate.unix(),
        visible: selectedJob.visible,
        experience: values.experience,
        education: values.education,
        quantity: values.quantity,
        position: values.position,
        workTime: values.workTime,
        deadline: values.deadline ? values.deadline.unix() : null,
        requirement: requirementValue,
        benefit: benefitValue,
        profile: profileValue,
        contact: {
          name: values.contactName,
          phone: values.contactPhone || "",
          email: values.contactEmail || "",
        },
      };

      const response = await axios.put(
        `/api/jobs/${selectedJob._id}`,
        jobData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedJob = { ...selectedJob, ...response.data.job };
      setJobs(jobs.map((j) => (j._id === selectedJob._id ? updatedJob : j)));
      message.success("Cập nhật tin tuyển dụng thành công!");
      if (socket) {
        socket.emit("job_updated", {
          jobId: selectedJob._id,
          data: updatedJob,
        });
      }
      handleCancel();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Lỗi khi cập nhật tin tuyển dụng!";
      message.error(errorMsg);
    }
  };

  const cleanHtml = (html) => {
    if (!html) return "Không xác định";
    return html
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const columns = [
    { title: "Tiêu đề", dataIndex: "title", key: "title" },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      render: (location) => cleanHtml(location),
    },
    {
      title: "Lương",
      dataIndex: "salary",
      key: "salary",
      render: (salary) => getSalaryLabel(salary),
    },
    {
      title: "Ngày đăng",
      dataIndex: "date",
      key: "date",
      render: (date) => moment.unix(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tin này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="employer-job-management-page">
      <h2>Quản Lý Tin Tuyển Dụng</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate("/employer/jobs")}
      >
        Thêm tin mới
      </Button>
      <Table
        columns={columns}
        dataSource={jobs}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 800 }}
      />

      <Modal
        title="Chỉnh sửa tin tuyển dụng"
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={() => handleCancel(true)}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên công việc"
            name="jobTitle"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề công việc" },
            ]}
          >
            <Input placeholder="Nhập tiêu đề công việc" />
          </Form.Item>

          <Form.Item
            label="Mô tả công việc"
            name="jobDescription"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả công việc" },
            ]}
          >
            <ReactQuill
              theme="snow"
              value={descriptionValue}
              onChange={(content) => {
                setDescriptionValue(content);
                form.setFieldsValue({ jobDescription: content });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Địa điểm làm việc"
            name="location"
            rules={[
              { required: true, message: "Vui lòng nhập địa điểm làm việc" },
            ]}
          >
            <Input placeholder="VD: TP. Hồ Chí Minh, Quận 1" />
          </Form.Item>

          <Form.Item label="Địa chỉ chi tiết" name="address">
            <ReactQuill
              theme="snow"
              value={addressValue}
              onChange={(content) => {
                setAddressValue(content);
                form.setFieldsValue({ address: content });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Danh mục công việc"
            name="category"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              <Option value="IT">Công nghệ thông tin</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Finance">Tài chính</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Cấp bậc"
            name="level"
            rules={[{ required: true, message: "Vui lòng chọn cấp bậc" }]}
          >
            <Select placeholder="Chọn cấp bậc">
              <Option value="Nhân viên">Nhân viên</Option>
              <Option value="Sinh viên">Sinh viên</Option>
              <Option value="Trưởng nhóm/ Giám sát">Trưởng nhóm</Option>
              <Option value="Quản lý">Quản lý</Option>
              <Option value="Điều hành cấp cao">Điều hành cấp cao</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Mức lương"
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

          <Form.Item
            label="Số lượng cần tuyển"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <Input type="number" placeholder="VD: 5" />
          </Form.Item>

          <Form.Item
            label="Chức vụ"
            name="position"
            rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
          >
            <Input placeholder="VD: Nhân viên, Quản lý..." />
          </Form.Item>

          <Form.Item
            label="Hình thức làm việc"
            name="workTime"
            rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
          >
            <Select placeholder="Chọn hình thức">
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

          <Form.Item
            label="Hạn nộp hồ sơ"
            name="deadline"
            rules={[{ required: true, message: "Vui lòng chọn hạn nộp hồ sơ" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD-MM-YYYY"
              value={form.getFieldValue("deadline")}
            />
          </Form.Item>

          <Form.Item
            label="Yêu cầu công việc"
            name="requirement"
            rules={[{ required: true, message: "Vui lòng nhập yêu cầu" }]}
          >
            <ReactQuill
              theme="snow"
              value={requirementValue}
              onChange={(content) => {
                setRequirementValue(content);
                form.setFieldsValue({ requirement: content });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Quyền lợi"
            name="benefit"
            rules={[{ required: true, message: "Vui lòng nhập quyền lợi" }]}
          >
            <ReactQuill
              theme="snow"
              value={benefitValue}
              onChange={(content) => {
                setBenefitValue(content);
                form.setFieldsValue({ benefit: content });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Yêu cầu hồ sơ"
            name="profile"
            rules={[{ required: true, message: "Vui lòng nhập yêu cầu hồ sơ" }]}
          >
            <ReactQuill
              theme="snow"
              value={profileValue}
              onChange={(content) => {
                setProfileValue(content);
                form.setFieldsValue({ profile: content });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Tên người liên hệ"
            name="contactName"
            rules={[
              { required: true, message: "Vui lòng nhập tên người liên hệ" },
            ]}
          >
            <Input placeholder="Nhập tên liên hệ" />
          </Form.Item>

          <Form.Item
            label="SĐT liên hệ"
            name="contactPhone"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input placeholder="VD: 090xxx" />
          </Form.Item>

          <Form.Item
            label="Email liên hệ"
            name="contactEmail"
            rules={[
              { required: true, message: "Vui lòng nhập email liên hệ" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="VD: email@example.com" />
          </Form.Item>

          <Form.Item
            label="Ngày đăng tuyển"
            name="postedDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày đăng tuyển" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployerJobManagementPage;
