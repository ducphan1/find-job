import React from "react";
import PublicLayout from "../layout/PublicLayout";
import "../styles/HomePage.css";
import image1 from "../assets/triviet.jpg";
import image2 from "../assets/hungphuc.jpg";
import logo1 from "../assets/logotriviet.jpg";
import logo2 from "../assets/logohungphuc.jpg";
import {
  faFileCircleCheck,
  faClipboardList,
  faLock,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import RecruiterCarousel from "../components/RecruiterCarousel";
import FeatureSection from "../components/FeatureSection";
import JobListings from "../components/JobListings";
import FeaturedCompanies from "../components/FeaturedCompanies";
import LatestCandidates from "../components/LatestCandidates";

const recruiters = [
  {
    id: 1,
    company: "CÔNG TY TNHH QUỐC TẾ TRI-VIET (100% VỐN ĐẦU TƯ NHẬT BẢN)",
    logo: logo1,
    image: image1,
    address: "Lô 2-9A, KCN Trà Nóc II, P. Phước Thới, Q. Ô Môn, TP. Cần Thơ",
    jobs: [
      "Nhân Viên Nhân Sự",
      "Nhân Viên QA",
      "Nhân Viên Thiết Kế Mẫu Rập",
      "Nhân Viên Xuất Nhập Khẩu",
    ],
  },
  {
    id: 2,
    company: "CÔNG TY TNHH MỘT THÀNH VIÊN HÙNG PHÚC",
    logo: logo2,
    image: image2,
    address:
      "Lô 2 - 9A2, Đường số 10, KCN Trà Nóc 2, Phước Thới, Ô Môn, Cần Thơ",
    jobs: [
      "Kỹ Sư Nuôi Trồng Thủy Sản",
      "Thống Kê Vùng Nuôi",
      "Nhân Viên Bảo Trì, Lắp Đặt Camera",
    ],
  },
];

const features = [
  {
    id: 1,
    icon: faFileCircleCheck,
    title: "TẠO CV NGAY",
    desc: "Tạo hồ sơ miễn phí, có ngay việc làm ưng ý",
  },
  {
    id: 2,
    icon: faClipboardList,
    title: "ĐĂNG TIN MIỄN PHÍ",
    desc: "Tiếp cận nhanh nhất, với hơn 90 ngàn hồ sơ tìm việc",
  },
  { id: 3, icon: faLock, title: "ĐĂNG NHẬP", desc: "" },
  { id: 4, icon: faRightToBracket, title: "ĐĂNG KÝ", desc: "" },
];

const HomePage = () => {
  return (
    <PublicLayout>
      <div className="homepage">
        <h2 className="homepage-title">NHÀ TUYỂN DỤNG HÀNG ĐẦU</h2>
        <RecruiterCarousel recruiters={recruiters} />
      </div>
      <FeatureSection features={features} />
      <JobListings />
      <FeaturedCompanies />
      <LatestCandidates />
    </PublicLayout>
  );
};

export default HomePage;
