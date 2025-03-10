import React, { useState, useEffect } from "react";
import {
  Button,
  Select,
  Checkbox,
  Form,
  Upload,
  message,
  Tabs,
  Table,
  Modal,
  Space,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { io } from "socket.io-client"; // Import Socket.IO client
import "../../../styles/AdminDashboardPage.css";

const { Option } = Select;
const { TabPane } = Tabs;

const AdminSlidesPage = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [newSlide, setNewSlide] = useState({
    backgroundImage: "",
    logo: "",
    jobs: [],
    companyId: "",
  });
  const [previewBackgroundImage, setPreviewBackgroundImage] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [slides, setSlides] = useState([]);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [socket, setSocket] = useState(null); // State for Socket.IO connection

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"; // Adjust if needed

  // Initialize Socket.IO connection and fetch initial data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` }, // Pass token for authentication
    });
    setSocket(newSocket);

    // Listen for slide-related notifications
    newSocket.on("notification", (data) => {
      if (data.type === "slide_created") {
        message.success(`Thông báo: ${data.message}`);
        if (data.companyId === selectedCompany?._id) {
          setSlides((prev) => [...prev, data]); // Add new slide to list
        }
      } else if (data.type === "slide_updated" && data._id) {
        message.info(`Thông báo: ${data.message}`);
        setSlides((prev) =>
          prev.map((slide) => (slide._id === data._id ? data : slide))
        );
      } else if (data.type === "slide_deleted" && data._id) {
        message.warning(`Thông báo: ${data.message}`);
        setSlides((prev) => prev.filter((slide) => slide._id !== data._id));
      }
    });

    // Fetch companies
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/companies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Lỗi khi lấy danh sách công ty"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [API_URL]);

  // Fetch company jobs when a company is selected
  useEffect(() => {
    const fetchCompanyJobs = async () => {
      if (!selectedCompany) {
        setCompanyJobs([]);
        setSelectedJobs([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/admin/companies/${selectedCompany._id}/jobs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCompanyJobs(response.data || []);
        setNewSlide((prev) => ({ ...prev, companyId: selectedCompany._id }));
      } catch (error) {
        setError(
          error.response?.data?.message || "Lỗi khi lấy danh sách công việc"
        );
        setCompanyJobs([]);
      }
    };
    fetchCompanyJobs();
  }, [selectedCompany, API_URL]);

  // Fetch slides for the selected company
  useEffect(() => {
    const fetchSlides = async () => {
      if (!selectedCompany) {
        setSlides([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/admin/slides`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { companyId: selectedCompany._id },
        });
        setSlides(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Lỗi khi lấy danh sách slide"
        );
        setSlides([]);
      }
    };
    fetchSlides();
  }, [selectedCompany, API_URL]);

  // Handle image upload and preview
  const handleImageUpload = async (file, field) => {
    if (!file) return false;

    const previewUrl = URL.createObjectURL(file);
    if (field === "backgroundImage") {
      setPreviewBackgroundImage(previewUrl);
    } else if (field === "logo") {
      setPreviewLogo(previewUrl);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const url = `${API_URL}/upload/company-logos`;
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setNewSlide((prev) => ({ ...prev, [field]: response.data.secure_url }));
      return false;
    } catch (error) {
      message.error(
        `Lỗi khi tải lên ${field}: ${error.response?.data?.message}`
      );
      return false;
    }
  };

  // Handle image upload for edit modal
  const handleEditImageUpload = async (file, field) => {
    if (!file) return false;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const url = `${API_URL}/upload/company-logos`;
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      editForm.setFieldsValue({ [field]: response.data.secure_url });
      return false;
    } catch (error) {
      message.error(
        `Lỗi khi tải lên ${field}: ${error.response?.data?.message}`
      );
      return false;
    }
  };

  // Reset form for adding a new slide
  const handleAddAnotherSlide = () => {
    setNewSlide({
      backgroundImage: "",
      logo: "",
      jobs: [],
      companyId: "",
    });
    setSelectedCompany(null);
    setSelectedJobs([]);
    setCompanyJobs([]);
    setPreviewBackgroundImage(null);
    setPreviewLogo(null);
    form.resetFields();
    setSuccessMessage(null);
    setError(null);
  };

  // Add a new slide
  const handleAddSlide = async () => {
    if (
      !newSlide.backgroundImage ||
      !newSlide.logo ||
      !selectedJobs.length ||
      !newSlide.companyId
    ) {
      setError("Vui lòng điền đầy đủ thông tin slide (hình ảnh và công việc)!");
      setSuccessMessage(null);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const slideData = { ...newSlide, jobs: selectedJobs };
      const response = await axios.post(`${API_URL}/admin/slides`, slideData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Slide đã được thêm thành công!");
      setError(null);
      if (socket && selectedCompany?._id === newSlide.companyId) {
        setSlides((prev) => [...prev, response.data]); // Update UI immediately
      }
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi khi thêm slide");
      setSuccessMessage(null);
    }
  };

  // Open edit modal
  const showEditModal = (slide) => {
    setSelectedSlide(slide);
    setSelectedJobs(slide.jobs);
    editForm.setFieldsValue({
      backgroundImage: slide.backgroundImage,
      logo: slide.logo,
      jobs: slide.jobs,
      isActive: slide.isActive,
    });
    setIsEditModalVisible(true);
  };

  // Close edit modal
  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setSelectedSlide(null);
    editForm.resetFields();
  };

  // Update slide
  const handleUpdateSlide = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const slideData = {
        backgroundImage: values.backgroundImage,
        logo: values.logo,
        jobs: selectedJobs,
        isActive: values.isActive,
      };
      const response = await axios.put(
        `${API_URL}/admin/slides/${selectedSlide._id}`,
        slideData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSlides((prev) =>
        prev.map((slide) =>
          slide._id === selectedSlide._id ? response.data.slide : slide
        )
      );
      setIsEditModalVisible(false);
      message.success("Cập nhật slide thành công!");
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi cập nhật slide");
    }
  };

  // Delete slide
  const handleDeleteSlide = async (slideId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa slide này?",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_URL}/admin/slides/${slideId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSlides((prev) => prev.filter((slide) => slide._id !== slideId));
          message.success("Xóa slide thành công!");
        } catch (error) {
          message.error(error.response?.data?.message || "Lỗi khi xóa slide");
        }
      },
    });
  };

  // Columns for slides table
  const columns = [
    {
      title: "Hình nền",
      dataIndex: "backgroundImage",
      render: (text) => (
        <img src={text} alt="Background" style={{ width: 100, height: 60 }} />
      ),
    },
    {
      title: "Logo",
      dataIndex: "logo",
      render: (text) => (
        <img src={text} alt="Logo" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: "Công việc",
      dataIndex: "jobs",
      render: (jobs) => jobs.join(", "),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive) => (isActive ? "Hoạt động" : "Không hoạt động"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteSlide(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="admin-slides-page">
      <h2>Quản lý Slide Tuyển Dụng</h2>

      <Tabs defaultActiveKey="1">
        {/* Tab Edit Slides */}
        <TabPane tab="Chỉnh sửa slide" key="1">
          <Select
            placeholder="Chọn công ty"
            style={{ width: 300, marginBottom: 16 }}
            onChange={(value) => {
              const company = companies.find((c) => c._id === value);
              setSelectedCompany(company);
            }}
            value={selectedCompany?._id}
          >
            {companies.map((company) => (
              <Option key={company._id} value={company._id}>
                {company.name}
              </Option>
            ))}
          </Select>

          {selectedCompany && (
            <>
              {slides.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={slides}
                  rowKey="_id"
                  pagination={false}
                />
              ) : (
                <p>Không có slide nào cho công ty này.</p>
              )}
            </>
          )}

          {/* Edit Modal */}
          <Modal
            title="Chỉnh sửa Slide"
            visible={isEditModalVisible}
            onCancel={handleEditModalCancel}
            footer={null}
          >
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateSlide}
              initialValues={{ isActive: true }}
            >
              <Form.Item
                label="Hình nền"
                name="backgroundImage"
                rules={[
                  { required: true, message: "Vui lòng tải lên hình nền!" },
                ]}
              >
                <Upload
                  beforeUpload={(file) =>
                    handleEditImageUpload(file, "backgroundImage")
                  }
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Chọn hình nền</Button>
                </Upload>
                <img
                  src={
                    editForm.getFieldValue("backgroundImage") ||
                    selectedSlide?.backgroundImage
                  }
                  alt="Background"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    marginTop: 8,
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Logo"
                name="logo"
                rules={[{ required: true, message: "Vui lòng tải lên logo!" }]}
              >
                <Upload
                  beforeUpload={(file) => handleEditImageUpload(file, "logo")}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Chọn logo</Button>
                </Upload>
                <img
                  src={editForm.getFieldValue("logo") || selectedSlide?.logo}
                  alt="Logo"
                  style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    marginTop: 8,
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Công việc muốn hiển thị (tối đa 4)"
                name="jobs"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất 1 công việc!",
                  },
                ]}
              >
                <Checkbox.Group
                  options={companyJobs.map((job) => ({
                    label: job.title || job,
                    value: job.title || job,
                  }))}
                  onChange={(checkedValues) =>
                    setSelectedJobs(checkedValues.slice(0, 4))
                  }
                />
              </Form.Item>

              <Form.Item
                label="Trạng thái"
                name="isActive"
                valuePropName="checked"
              >
                <Checkbox>Hoạt động</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Cập nhật
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>

        {/* Tab Add New Slide */}
        <TabPane tab="Thêm mới slide" key="2">
          {successMessage && (
            <div
              style={{
                marginBottom: 16,
                padding: 16,
                background: "#e6f7ff",
                border: "1px solid #91d5ff",
                borderRadius: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{successMessage}</span>
              <Button type="primary" onClick={handleAddAnotherSlide}>
                Thêm slide nữa
              </Button>
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: 16,
                background: "#fff1f0",
                border: "1px solid #ffa39e",
                borderRadius: 4,
              }}
            >
              {error}
            </div>
          )}

          <Select
            placeholder="Chọn công ty"
            style={{ width: 300, marginBottom: 16 }}
            onChange={(value) => {
              const company = companies.find((c) => c._id === value);
              setSelectedCompany(company);
              form.resetFields(["backgroundImage", "logo", "jobs"]);
              setPreviewBackgroundImage(null);
              setPreviewLogo(null);
              setSelectedJobs([]);
            }}
            value={selectedCompany?._id}
          >
            {companies.map((company) => (
              <Option key={company._id} value={company._id}>
                {company.name}
              </Option>
            ))}
          </Select>

          {selectedCompany && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddSlide}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                label="Hình nền"
                name="backgroundImage"
                rules={[
                  { required: true, message: "Vui lòng tải lên hình nền!" },
                ]}
              >
                <Upload
                  beforeUpload={(file) =>
                    handleImageUpload(file, "backgroundImage")
                  }
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Chọn hình nền</Button>
                </Upload>
                {previewBackgroundImage && (
                  <img
                    src={previewBackgroundImage}
                    alt="Preview Background"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      marginTop: 8,
                    }}
                  />
                )}
              </Form.Item>

              <Form.Item
                label="Logo"
                name="logo"
                rules={[{ required: true, message: "Vui lòng tải lên logo!" }]}
              >
                <Upload
                  beforeUpload={(file) => handleImageUpload(file, "logo")}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Chọn logo</Button>
                </Upload>
                {previewLogo && (
                  <img
                    src={previewLogo}
                    alt="Preview Logo"
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      marginTop: 8,
                    }}
                  />
                )}
              </Form.Item>

              <Form.Item
                label="Công việc muốn hiển thị (tối đa 4)"
                name="jobs"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất 1 công việc!",
                  },
                ]}
              >
                <Checkbox.Group
                  options={companyJobs.map((job) => ({
                    label: job.title || job,
                    value: job.title || job,
                  }))}
                  onChange={(checkedValues) =>
                    setSelectedJobs(checkedValues.slice(0, 4))
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm slide mới
                </Button>
              </Form.Item>
            </Form>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AdminSlidesPage;
