import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Select, Button, Upload, message, Spin } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { io } from "socket.io-client"; // Thêm Socket.IO client
import "../../../styles/EditCompanyPage.css";

const EditCompanyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [socket, setSocket] = useState(null); // State cho kết nối Socket.IO

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const SOCKET_URL =
    process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"; // URL Socket.IO

  // Thiết lập Socket.IO và lấy dữ liệu công ty
  useEffect(() => {
    if (!id || id === "undefined") {
      message.error("ID công ty không hợp lệ");
      navigate("/employer/dashboard");
      return;
    }

    const token = localStorage.getItem("token");
    const newSocket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` }, // Xác thực bằng token
    });
    setSocket(newSocket);

    // Lắng nghe thông báo từ server
    newSocket.on("notification", (data) => {
      if (data.type === "company_updated" && data.companyId === id) {
        message.success(`Thông báo: ${data.message}`);
        setCompanyData(data.company); // Cập nhật dữ liệu công ty nếu cần
        form.setFieldsValue({
          name: data.company.name || "",
          address: data.company.address || "",
          phone: data.company.phone || "",
          email: data.company.email || "",
          website: data.company.website || "",
          taxId: data.company.taxId || "",
          type: data.company.type || "Khác",
          size: data.company.size ?? 0,
          industry: data.company.industry || "",
          logo: data.company.logo
            ? [
                {
                  uid: "-1",
                  name: "logo",
                  status: "done",
                  url: data.company.logo,
                },
              ]
            : [],
        });
      }
    });

    // Lấy thông tin công ty ban đầu
    const fetchCompany = async () => {
      try {
        setLoading(true);
        if (!token) {
          throw new Error("Không có token, vui lòng đăng nhập lại");
        }

        const response = await axios.get(`${API_URL}/companies/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data) {
          throw new Error("Không nhận được dữ liệu công ty từ server");
        }

        const data = response.data;
        setCompanyData(data);
        form.setFieldsValue({
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          taxId: data.taxId || "",
          type: data.type || "Khác",
          size: data.size ?? 0,
          industry: data.industry || "",
          logo: data.logo
            ? [{ uid: "-1", name: "logo", status: "done", url: data.logo }]
            : [],
        });
      } catch (error) {
        message.error(`Lỗi khi tải thông tin công ty: ${error.message}`);
        console.error("Lỗi khi lấy dữ liệu công ty:", error);
        if (error.response?.status === 404) {
          message.error("Công ty không tồn tại");
          navigate("/employer/dashboard");
        } else if (error.response?.status === 403) {
          message.error("Bạn không có quyền truy cập công ty này");
          navigate("/employer/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();

    // Dọn dẹp khi component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [id, form, navigate, API_URL]);

  // Xử lý submit form
  const onFinish = async (values) => {
    try {
      setLoading(true);
      let logoUrl = companyData?.logo || "";

      if (values.logo?.length > 0 && values.logo[0].originFileObj) {
        const formData = new FormData();
        formData.append("file", values.logo[0].originFileObj);
        const uploadResponse = await axios.post(
          `${API_URL}/upload-image/company-logos`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        logoUrl = uploadResponse.data.secure_url;
      } else if (values.logo?.length > 0) {
        logoUrl = values.logo[0].url;
      }

      const updatedCompany = {
        name: values.name,
        address: values.address,
        phone: values.phone,
        email: values.email,
        website: values.website,
        taxId: values.taxId,
        type: values.type,
        size: parseInt(values.size) || 0,
        industry: values.industry,
        logo: logoUrl,
      };

      const response = await axios.put(
        `${API_URL}/companies/${id}`,
        updatedCompany,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      message.success("Cập nhật thông tin công ty thành công");

      // Phát thông báo qua Socket.IO (tùy chọn)
      if (socket) {
        socket.emit("companyUpdated", {
          companyId: id,
          company: response.data,
          message: `Công ty ${values.name} đã được cập nhật thành công.`,
          type: "company_updated",
        });
      }

      navigate("/employer/dashboard");
    } catch (error) {
      message.error("Lỗi khi cập nhật thông tin công ty");
      console.error("Lỗi khi cập nhật:", error);
      if (error.response?.status === 403) {
        message.error("Bạn không có quyền cập nhật công ty này");
      }
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  return (
    <div className="edit-company-page">
      <h2>Chỉnh sửa thông tin công ty</h2>
      {loading ? (
        <Spin size="large" tip="Đang tải thông tin công ty..." />
      ) : companyData ? (
        <Form
          form={form}
          name="editCompany"
          onFinish={onFinish}
          layout="vertical"
          className="edit-company-form"
        >
          <Form.Item
            name="name"
            label="Tên công ty"
            rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
          >
            <Input placeholder="Nhập tên công ty" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input placeholder="Nhập địa chỉ công ty" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập email công ty" />
          </Form.Item>
          <Form.Item name="website" label="Website">
            <Input placeholder="Nhập website công ty (nếu có)" />
          </Form.Item>
          <Form.Item
            name="taxId"
            label="Mã số thuế"
            rules={[{ required: true, message: "Vui lòng nhập mã số thuế" }]}
          >
            <Input placeholder="Nhập mã số thuế" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại hình công ty"
            rules={[
              { required: true, message: "Vui lòng chọn loại hình công ty" },
            ]}
          >
            <Select placeholder="Chọn loại hình công ty">
              <Select.Option value="TNHH">TNHH</Select.Option>
              <Select.Option value="Cổ phần">Cổ phần</Select.Option>
              <Select.Option value="Tư nhân">Tư nhân</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="size"
            label="Số lượng nhân viên"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng nhân viên" },
              {
                type: "number",
                min: 0,
                message: "Số lượng nhân viên phải là số không âm",
              },
            ]}
          >
            <Input type="number" placeholder="Ví dụ: 50, 100, 500" />
          </Form.Item>
          <Form.Item
            name="industry"
            label="Lĩnh vực kinh doanh"
            rules={[
              { required: true, message: "Vui lòng nhập lĩnh vực kinh doanh" },
            ]}
          >
            <Input placeholder="Nhập lĩnh vực kinh doanh" />
          </Form.Item>
          <Form.Item
            name="logo"
            label="Logo công ty"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              name="logo"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <Button icon={<CloudUploadOutlined />}>Tải lên logo</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu thay đổi
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate("/employer/dashboard")}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <p>Không có dữ liệu công ty để hiển thị. Vui lòng thử lại sau.</p>
      )}
    </div>
  );
};

export default EditCompanyPage;
