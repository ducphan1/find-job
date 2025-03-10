import React, { useState, useEffect } from "react";
import { Button, Input } from "antd";
import axios from "axios";
import "../../../styles/AdminDashboardPage.css";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    notificationConfig: "",
    policy: "",
    emailSettings: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSettings(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Lỗi khi lấy cài đặt");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [API_URL]);

  const handleUpdateSettings = async (field) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/admin/settings`,
        { [field]: settings[field] },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`Cập nhật ${field} thành công!`);
    } catch (error) {
      setError(error.response?.data?.message || "Lỗi khi cập nhật cài đặt");
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-settings-page">
      <h2>Cài đặt hệ thống</h2>
      <div className="settings-section">
        <h3>Thông báo hệ thống</h3>
        <Input
          value={settings.notificationConfig}
          onChange={(e) =>
            setSettings({ ...settings, notificationConfig: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Button onClick={() => handleUpdateSettings("notificationConfig")}>
          Thiết lập thông báo
        </Button>
      </div>
      <div className="settings-section">
        <h3>Chính sách</h3>
        <Input
          value={settings.policy}
          onChange={(e) => setSettings({ ...settings, policy: e.target.value })}
          style={{ marginBottom: 10 }}
        />
        <Button onClick={() => handleUpdateSettings("policy")}>
          Cập nhật chính sách
        </Button>
      </div>
      <div className="settings-section">
        <h3>Cấu hình email</h3>
        <Input
          value={settings.emailSettings}
          onChange={(e) =>
            setSettings({ ...settings, emailSettings: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Button onClick={() => handleUpdateSettings("emailSettings")}>
          Cập nhật cấu hình email
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
