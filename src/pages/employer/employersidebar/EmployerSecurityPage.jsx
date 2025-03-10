import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Input, Upload, Button, message, Select } from "antd";
import {
  FileTextOutlined,
  BankOutlined,
  ApiOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import "../../../styles/EmployerDashboardPage.css";

const { Option } = Select;

const EmployerSecurityPage = () => {
  const [activeKey, setActiveKey] = useState("license");

  const [companyData, setCompanyData] = useState(null);
  const [companyForm] = Form.useForm();

  // *** Thêm state để quản lý fileList
  const [licenseFileList, setLicenseFileList] = useState([]);
  const [idFileList, setIdFileList] = useState([]);

  // Xử lý tab
  const handleMenuClick = (key) => {
    setActiveKey(key);
  };

  // Lấy dữ liệu công ty
  useEffect(() => {
    const fetchMyCompany = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          message.error("Vui lòng đăng nhập trước!");
          return;
        }
        const res = await axios.get("/api/companies/my-company", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Company data:", res.data);
        setCompanyData(res.data);

        companyForm.setFieldsValue({
          companyName: res.data.name,
          taxCode: res.data.taxId,
          size: res.data.size?.toString() || "",
          contactEmail: res.data.email,
          address: res.data.address,
          type: res.data.type,
          industry: res.data.industry,
        });
      } catch (error) {
        console.error(
          "Lỗi fetch my-company:",
          error.response?.data || error.message
        );
        message.error("Không thể tải thông tin công ty!");
      }
    };

    fetchMyCompany();
  }, [companyForm]);

  // **** Xử lý khi user thay đổi file license
  const handleChangeLicense = ({ fileList }) => {
    setLicenseFileList(fileList);
  };
  // **** Xử lý khi user thay đổi file idFile
  const handleChangeIdFile = ({ fileList }) => {
    setIdFileList(fileList);
  };

  // ====== 1) Xử lý Form “Giấy đăng ký doanh nghiệp” ======
  const onFinishLicense = async (values) => {
    console.log("Giấy phép:", values);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập trước!");
        return;
      }

      // Kiểm tra xem user có chọn file licenseFileList[0] chưa
      if (licenseFileList.length === 0 && idFileList.length === 0) {
        message.error("Bạn chưa chọn file giấy tờ nào!");
        return;
      }

      // Upload licenseFile
      if (licenseFileList.length > 0) {
        const formData = new FormData();
        formData.append("file", licenseFileList[0].originFileObj);

        const res1 = await axios.post("/api/upload/company-docs", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Kết quả upload licenseFile:", res1.data);
      }

      // Upload idFile
      if (idFileList.length > 0) {
        const formData2 = new FormData();
        formData2.append("file", idFileList[0].originFileObj);

        const res2 = await axios.post("/api/upload/company-docs", formData2, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Kết quả upload idFile:", res2.data);
      }

      message.success("Đã upload giấy phép đăng ký doanh nghiệp thành công!");
    } catch (error) {
      console.error(
        "Upload license error:",
        error.response?.data || error.message
      );
      message.error("Lỗi khi upload giấy tờ!");
    }
  };

  // ====== 2) Xử lý Form “Thông tin công ty” ======
  const onFinishCompany = async (values) => {
    console.log("Form công ty submit:", values);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Vui lòng đăng nhập trước!");
        return;
      }

      if (!companyData?._id) {
        message.error("Không tìm thấy công ty để cập nhật!");
        return;
      }

      const updateData = {
        name: values.companyName,
        taxId: values.taxCode,
        size: parseInt(values.size, 10) || 0,
        email: values.contactEmail,
        address: values.address,
        type: values.type,
        industry: values.industry,
      };

      const res = await axios.put(
        `/api/companies/${companyData._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Cập nhật công ty thành công:", res.data);
      message.success("Đã cập nhật thông tin công ty!");
    } catch (error) {
      console.error(
        "Lỗi cập nhật công ty:",
        error.response?.data || error.message
      );
      message.error("Cập nhật công ty thất bại!");
    }
  };

  // ====== 3) Xử lý Form “Kết nối API” ======
  const onFinishAPI = (values) => {
    console.log("Kết nối API:", values);
    message.success("Đã cập nhật cấu hình API!");
  };

  return (
    <div className="security-page-container">
      {/* Sidebar trái */}
      <div className="security-sidebar">
        <ul className="security-menu">
          <li
            className={`menu-item ${activeKey === "license" ? "active" : ""}`}
            onClick={() => handleMenuClick("license")}
          >
            <FileTextOutlined />
            Giấy đăng ký doanh nghiệp
          </li>
          <li
            className={`menu-item ${activeKey === "company" ? "active" : ""}`}
            onClick={() => handleMenuClick("company")}
          >
            <BankOutlined />
            Thông tin công ty
          </li>
          <li
            className={`menu-item ${activeKey === "api" ? "active" : ""}`}
            onClick={() => handleMenuClick("api")}
          >
            <ApiOutlined />
            Kết nối API
          </li>
        </ul>
      </div>

      {/* Nội dung bên phải */}
      <div className="security-content">
        {/* ====== Giấy đăng ký doanh nghiệp ====== */}
        {activeKey === "license" && (
          <div>
            <h2>Giấy đăng ký doanh nghiệp</h2>
            <p>
              Vui lòng lựa chọn phương thức đăng tải, xem hướng dẫn đăng tải
              <a href="https://example.com" target="_blank" rel="noreferrer">
                {" "}
                Tại đây
              </a>
            </p>

            <Form
              layout="vertical"
              onFinish={onFinishLicense}
              style={{ maxWidth: 600 }}
            >
              <Form.Item label="Giấy tờ" name="licenseFile">
                <Upload
                  beforeUpload={() => false} // Không upload ngay
                  maxCount={1}
                  fileList={licenseFileList}
                  onChange={handleChangeLicense}
                >
                  <Button icon={<UploadOutlined />}>Chọn file</Button>
                </Upload>
                <p style={{ marginTop: 5, fontSize: 12, color: "#999" }}>
                  Dung lượng tối đa 5MB, định dạng JPG/PNG/PDF
                </p>
              </Form.Item>

              <Form.Item label="Hoặc Giấy tờ định danh" name="idFile">
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  fileList={idFileList}
                  onChange={handleChangeIdFile}
                >
                  <Button icon={<UploadOutlined />}>Chọn file</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}

        {/* ====== Thông tin công ty ====== */}
        {activeKey === "company" && (
          <div>
            <h2>Thông tin công ty</h2>
            <p>
              Xác thực tài khoản điện tử giúp bạn: Tăng mức độ tin cậy với ứng
              viên, bảo vệ thương hiệu tuyển dụng...
            </p>
            <Button type="primary" style={{ marginBottom: 20 }}>
              Xác thực ngay
            </Button>

            <Form
              layout="vertical"
              onFinish={onFinishCompany}
              form={companyForm}
              style={{ maxWidth: 600 }}
            >
              <Form.Item label="Tên công ty" name="companyName">
                <Input placeholder="VD: Công ty TNHH ABC" />
              </Form.Item>

              <Form.Item label="Mã số thuế / Mã số DN" name="taxCode">
                <Input placeholder="Nhập mã số thuế" />
              </Form.Item>

              <Form.Item label="Quy mô (số nhân viên)" name="size">
                <Input placeholder="VD: 50" />
              </Form.Item>

              <Form.Item label="Email liên hệ" name="contactEmail">
                <Input placeholder="VD: hr@company.com" />
              </Form.Item>

              <Form.Item label="Địa chỉ" name="address">
                <Input placeholder="VD: Số 123, đường ABC..." />
              </Form.Item>

              <Form.Item label="Loại hình" name="type">
                <Select placeholder="Chọn loại hình">
                  <Option value="TNHH">TNHH</Option>
                  <Option value="Cổ phần">Cổ phần</Option>
                  <Option value="Tư nhân">Tư nhân</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Ngành nghề" name="industry">
                <Input placeholder="VD: CNTT, Xây dựng..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}

        {/* ====== Kết nối API ====== */}
        {activeKey === "api" && (
          <div>
            <h2>Kết nối API</h2>
            <p>
              Kết nối API giúp nhà tuyển dụng đồng bộ hoá dữ liệu với các phần
              mềm của bên thứ 3...
              <br />
              <a
                href="https://example.com/api-docs"
                target="_blank"
                rel="noreferrer"
              >
                Hướng dẫn sử dụng
              </a>
            </p>

            <Form
              layout="vertical"
              onFinish={onFinishAPI}
              style={{ maxWidth: 600 }}
            >
              <Form.Item label="API Key" name="apiKey">
                <Input placeholder="Nhập API Key" />
              </Form.Item>
              <Form.Item label="Webhook URL" name="webhook">
                <Input placeholder="VD: https://domain.com/webhook" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lưu
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerSecurityPage;
