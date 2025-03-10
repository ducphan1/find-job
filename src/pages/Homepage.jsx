import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";

import PublicLayout from "../layout/PublicLayout";
import "../styles/HomePage.css";
import {
  faFileCircleCheck,
  faClipboardList,
  faLock,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import RecruiterCarousel from "../components/RecruiterCarousel";

import JobListings from "../components/JobListings";
import FeaturedCompanies from "../components/FeaturedCompanies";
import LatestCandidates from "../components/LatestCandidates";

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
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Hàm lấy danh sách slide
  const fetchSlides = async () => {
    try {
      console.log("Fetching slides from API:", `${API_URL}/public-slides`);
      const response = await axios.get(`${API_URL}/public-slides`, {
        headers: {
          "Cache-Control": "no-cache", // Tránh cache từ browser
        },
      });
      console.log("Slides received:", response.data);
      setSlides(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải danh sách slide");
      console.error("Error fetching slides:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();

    const intervalId = setInterval(fetchSlides, 30000);

    return () => clearInterval(intervalId);
  }, [API_URL]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchSlides();
    message.success("Đã làm mới danh sách slide!");
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

  return (
    <PublicLayout>
      <div className="homepage">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 className="homepage-title">CÔNG TY NỔI BẬT</h2>
        </div>
        <RecruiterCarousel slides={slides} />
      </div>

      <JobListings />
      <FeaturedCompanies />
      <LatestCandidates />
    </PublicLayout>
  );
};

export default HomePage;
