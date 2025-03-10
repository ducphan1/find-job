import React, { useEffect, useState } from "react";
import { Modal, Progress, Button, message } from "antd";
import {
  FilePdfOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  UserOutlined,
  AimOutlined,
  BookOutlined,
  SolutionOutlined,
  LaptopOutlined,
  GlobalOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "../../../styles/ViewProfileModal.css";

const ViewProfileModal = ({ visible, onClose }) => {
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      document.body.classList.add("modal-open");
      fetchProfileData();
    } else {
      document.body.classList.remove("modal-open");
    }
    // Cleanup khi component unmount
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [visible]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        message.warning("Bạn chưa đăng nhập!");
        return;
      }

      const userRes = await axios.get("http://localhost:5000/api/user/getme", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = userRes.data.user;
      console.log("userData từ /api/user/getme:", userData);

      let cvData = {};
      try {
        const cvRes = await axios.get("http://localhost:5000/api/cv", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cvs = cvRes.data.cvs || [];
        cvData = cvs.length > 0 ? cvs[0] : {};
        console.log("cvData từ /api/cv:", cvData);
      } catch (cvError) {
        if (cvError.response && cvError.response.status === 404) {
          console.log("Chưa có CV, sử dụng dữ liệu mặc định");
        } else {
          throw cvError;
        }
      }

      const combinedData = { ...userData, ...cvData };
      setProfileData(combinedData);
      console.log("profileData:", combinedData);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      message.error("Không thể tải hồ sơ!");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    message.info("Chức năng tải PDF demo!");
  };

  if (loading) {
    return (
      <Modal open={visible} onCancel={onClose} footer={null} width={1000}>
        <p style={{ textAlign: "center", color: "#000000" }}>
          Đang tải hồ sơ...
        </p>
      </Modal>
    );
  }

  if (!profileData || Object.keys(profileData).length === 0) {
    return (
      <Modal open={visible} onCancel={onClose} footer={null} width={1000}>
        <p style={{ textAlign: "center", color: "#000000" }}>
          Bạn chưa có thông tin hồ sơ!
        </p>
      </Modal>
    );
  }

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={1000}>
      <div className="profile-modal">
        <div className="content-section">
          <div className="sidebar">
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <img
                src={profileData.avatar || "https://i.pravatar.cc/150?img=12"}
                alt={profileData.hoTen || "Hồ sơ người dùng"}
                className="avatar"
              />
              <h2>{profileData.hoTen || "Chưa cập nhật tên"}</h2>
              <p>{profileData.chucDanh || "Chưa cập nhật chức danh"}</p>
            </div>

            <h3>
              <LaptopOutlined style={{ marginRight: 5 }} /> TRÌNH ĐỘ TIN HỌC
            </h3>
            {profileData.itSkills?.length > 0 ? (
              profileData.itSkills.map((skill, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <span
                    style={{
                      color: "#000000",
                      marginRight: 10,
                      fontSize: "14px",
                    }}
                  >
                    {skill.name}
                  </span>
                  <Progress
                    percent={
                      skill.proficiency === "Tốt"
                        ? 100
                        : skill.proficiency === "Khá"
                          ? 75
                          : skill.proficiency === "Trung bình"
                            ? 50
                            : 25
                    }
                    showInfo={false}
                    strokeColor="#1890ff"
                    strokeWidth={10}
                    style={{ width: "80%" }}
                  />
                </div>
              ))
            ) : (
              <p style={{ color: "#666666", fontSize: "14px" }}>
                Chưa có trình độ tin học
              </p>
            )}

            <h3>
              <GlobalOutlined style={{ marginRight: 5 }} /> TRÌNH ĐỘ NGOẠI NGỮ
            </h3>
            {profileData.languages?.length > 0 ? (
              profileData.languages.map((lang, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <span
                    style={{
                      color: "#000000",
                      marginRight: 10,
                      fontSize: "14px",
                    }}
                  >
                    {lang.name}
                  </span>
                  <Progress
                    percent={
                      lang.listening === "Tốt" &&
                      lang.speaking === "Tốt" &&
                      lang.writing === "Tốt" &&
                      lang.reading === "Tốt"
                        ? 100
                        : lang.listening === "Khá" ||
                            lang.speaking === "Khá" ||
                            lang.writing === "Khá" ||
                            lang.reading === "Khá"
                          ? 75
                          : lang.listening === "Trung bình" ||
                              lang.speaking === "Trung bình" ||
                              lang.writing === "Trung bình" ||
                              lang.reading === "Trung bình"
                            ? 50
                            : 25
                    }
                    showInfo={false}
                    strokeColor="#1890ff"
                    strokeWidth={10}
                    style={{ width: "80%" }}
                  />
                </div>
              ))
            ) : (
              <p style={{ color: "#666666", fontSize: "14px" }}>
                Chưa có trình độ ngoại ngữ
              </p>
            )}

            <h3>
              <ToolOutlined style={{ marginRight: 5 }} /> KỸ NĂNG
            </h3>
            {profileData.kyNangMem?.length > 0 ? (
              profileData.kyNangMem.map((skill, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <span
                    style={{
                      color: "#000000",
                      marginRight: 10,
                      fontSize: "14px",
                    }}
                  >
                    {skill.name || "Kỹ năng không xác định"}
                  </span>
                  <Progress
                    percent={Number(skill.rating) * 20}
                    showInfo={false}
                    strokeColor="#1890ff"
                    strokeWidth={10}
                    style={{ width: "80%" }}
                  />
                </div>
              ))
            ) : (
              <p style={{ color: "#666666", fontSize: "14px" }}>
                Chưa có kỹ năng mềm
              </p>
            )}

            {profileData.lapTrinh?.length > 0 ? (
              profileData.lapTrinh.map((skill, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <span
                    style={{
                      color: "#000000",
                      marginRight: 10,
                      fontSize: "14px",
                    }}
                  >
                    {skill.name || "Lập trình"}
                  </span>
                  <Progress
                    percent={Number(skill.rating) * 20}
                    showInfo={false}
                    strokeColor="#1890ff"
                    strokeWidth={10}
                    style={{ width: "80%" }}
                  />
                </div>
              ))
            ) : (
              <p style={{ color: "#666666", fontSize: "14px" }}>
                Chưa có kỹ năng lập trình
              </p>
            )}
          </div>

          <div className="main-content">
            <h3>
              <UserOutlined style={{ marginRight: 5 }} /> THÔNG TIN HỒ SƠ
            </h3>
            <p>
              <MailOutlined style={{ marginRight: 5 }} /> Email:{" "}
              {profileData.email || "Chưa cập nhật"}
            </p>
            <p>
              <PhoneOutlined style={{ marginRight: 5 }} /> Số điện thoại:{" "}
              {profileData.phone || "Chưa cập nhật"}
            </p>
            <p>
              <CalendarOutlined style={{ marginRight: 5 }} /> Ngày sinh:{" "}
              {profileData.ngaySinh
                ? new Date(profileData.ngaySinh).toLocaleDateString()
                : "Chưa cập nhật"}
            </p>
            <p>
              <EnvironmentOutlined style={{ marginRight: 5 }} /> Địa chỉ:{" "}
              {profileData.diaChi || "Chưa cập nhật"}
            </p>
            <p>
              Mức lương mong muốn:{" "}
              {profileData.mucLuongMongMuon || "Chưa cập nhật"}
            </p>
            <p>Cấp bậc mong muốn: {profileData.capBac || "Chưa cập nhật"}</p>
            <p>
              Số năm kinh nghiệm: {profileData.kinhNghiem || "Chưa cập nhật"}
            </p>
            <p>Lĩnh vực: {profileData.nganhNgheMongMuon || "Chưa cập nhật"}</p>
            <p>Hình thức việc làm: {profileData.hinhThuc || "Chưa cập nhật"}</p>
            <p>Nơi làm việc: {profileData.noiLamViec || "Chưa cập nhật"}</p>

            <h3>
              <AimOutlined style={{ marginRight: 5 }} /> MỤC TIÊU NGHỀ NGHIỆP
            </h3>
            <p>{profileData.mucTieu || "Chưa cập nhật mục tiêu nghề nghiệp"}</p>

            <h3>
              <BookOutlined style={{ marginRight: 5 }} /> HỌC VẤN/BẰNG CẤP
            </h3>
            {profileData.educationList?.length > 0 ? (
              profileData.educationList.map((edu, idx) => (
                <p key={idx}>
                  • {edu.tenBangCap} - {edu.donViDaoTao} (Từ{" "}
                  {edu.thoiGianBatDau?.thang}/{edu.thoiGianBatDau?.nam} -{" "}
                  {edu.thoiGianKetThuc?.thang}/{edu.thoiGianKetThuc?.nam})
                </p>
              ))
            ) : (
              <p style={{ color: "#666666" }}>Chưa có thông tin học vấn</p>
            )}

            <h3>
              <SolutionOutlined style={{ marginRight: 5 }} /> KINH NGHIỆM LÀM
              VIỆC
            </h3>
            {profileData.kinhNghiemList?.length > 0 ? (
              profileData.kinhNghiemList.map((exp, idx) => (
                <p key={idx}>
                  • {exp.chucDanh} - {exp.tenCongTy} (Từ{" "}
                  {exp.thoiGianBatDau?.thang}/{exp.thoiGianBatDau?.nam} -{" "}
                  {exp.dangLamViec
                    ? "Hiện tại"
                    : `${exp.thoiGianKetThuc?.thang}/${exp.thoiGianKetThuc?.nam}`}
                  )
                  <br />
                  {exp.moTa}
                </p>
              ))
            ) : (
              <p style={{ color: "#666666" }}>Chưa có kinh nghiệm làm việc</p>
            )}
          </div>
        </div>

        <div className="footer-buttons">
          <Button onClick={onClose} style={{ marginRight: 10 }}>
            Đóng
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={handleDownloadPDF}
          >
            Tải PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewProfileModal;
