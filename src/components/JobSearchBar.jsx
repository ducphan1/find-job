import React, { useState, useEffect } from "react";
import { Input, Select, Button, Modal, message } from "antd"; // Thêm message
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";
import "../styles/JobSearchBar.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import locations from "../data/locations.js";
import { jobCategories } from "../data/job.js";

const { Option } = Select;

const JobSearchBar = () => {
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [employerCount, setEmployerCount] = useState(0);
  const [applicantCount, setApplicantCount] = useState(0);
  const [advancedFilterVisible, setAdvancedFilterVisible] = useState(false);
  const [experience, setExperience] = useState(null);
  const [education, setEducation] = useState(null);
  const [position, setPosition] = useState(null);
  const [workTime, setWorkTime] = useState(null);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Khởi tạo Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, skipping Socket.IO connection");
      return;
    }

    const socket = io("http://localhost:5000", {
      query: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Socket.IO connected in JobSearchBar");
    });

    socket.on("notification", (notification) => {
      console.log("Received Socket.IO notification:", notification);
      if (notification.type === "job_created") {
        const newJob = notification.job;

        const matchesFilter =
          (!searchTitle ||
            newJob.title.toLowerCase().includes(searchTitle.toLowerCase())) &&
          (!selectedCategory || newJob.category === selectedCategory) &&
          (!selectedLocation || newJob.location === selectedLocation) &&
          (!experience || newJob.experience === experience) &&
          (!education || newJob.education === education) &&
          (!position || newJob.position === position) &&
          (!workTime || newJob.workTime === workTime);

        if (matchesFilter) {
          message.success(
            `${notification.message} Nhấn "Tìm kiếm" để cập nhật kết quả!`
          );
        }
      } else {
        message.info(notification.message);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [
    searchTitle,
    selectedCategory,
    selectedLocation,
    experience,
    education,
    position,
    workTime,
  ]);

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const companiesResponse = await axios.get("/api/companies", {
          headers: { "Cache-Control": "no-cache" },
        });
        setEmployerCount(companiesResponse.data.length);
        setApplicantCount(7);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTitle) params.append("title", searchTitle);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedLocation) params.append("location", selectedLocation);
      if (experience) params.append("experience", experience);
      if (education) params.append("education", education);
      if (position) params.append("position", position);
      if (workTime) params.append("workTime", workTime);

      const response = await axios.get(`/api/jobs/search?${params.toString()}`);
      const filteredJobs = response.data || [];

      const searchParams = {
        title: searchTitle || null,
        category: selectedCategory || null,
        location: selectedLocation || null,
        experience: experience || null,
        education: education || null,
        position: position || null,
        workTime: workTime || null,
      };

      navigate("/job-listings", { state: { filteredJobs, searchParams } });
    } catch (error) {
      console.error(
        "Lỗi khi tìm kiếm công việc:",
        error.response?.data || error.message
      );
      navigate("/job-listings", {
        state: { filteredJobs: [], searchParams: {} },
      });
    }
  };

  const locationList = Array.isArray(locations)
    ? locations
    : locations.provinces || [];

  return (
    <div className="job-search-container">
      <div className="search-section">
        <div className="search-filters">
          <Input
            placeholder="Tiêu đề công việc, vị trí..."
            prefix={<SearchOutlined />}
            className="search-input"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
          <Select
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value)}
            className="filter-select"
            suffixIcon={<FilterOutlined />}
            placeholder="Lọc theo ngành nghề"
            showSearch
          >
            <Option value={null}>Tất cả ngành nghề</Option>
            {jobCategories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
          <Select
            value={selectedLocation}
            onChange={(value) => setSelectedLocation(value)}
            className="filter-select"
            suffixIcon={<FilterOutlined />}
            placeholder="Lọc theo địa điểm"
            showSearch
          >
            <Option value={null}>Tất cả địa điểm</Option>
            {locationList.map((location) => (
              <Option
                key={location.code || location}
                value={location.name || location}
              >
                {location.name || location}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            className="search-button"
            onClick={handleSearch}
          >
            <SearchOutlined /> Tìm kiếm
          </Button>
        </div>
        <div className="job-stats">
          <span className="employer-count">
            <strong>{employerCount}</strong> Cty đang tuyển dụng
          </span>
          <span className="applicant-count">
            <strong>{applicantCount}</strong> Hồ sơ ứng viên
          </span>
        </div>
      </div>
      <div className="advanced-filter-section">
        <Button
          className="filter-button"
          onClick={() => setAdvancedFilterVisible(true)}
        >
          <FilterOutlined /> Lọc nâng cao
        </Button>
      </div>

      <Modal
        title="Lọc nâng cao"
        visible={advancedFilterVisible}
        onCancel={() => setAdvancedFilterVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAdvancedFilterVisible(false)}>
            Hủy
          </Button>,
          <Button key="search" type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>,
        ]}
      >
        <Select
          value={experience}
          onChange={(value) => setExperience(value)}
          placeholder="Kinh nghiệm"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <Option value={null}>Tất cả</Option>
          <Option value="Dưới 1 năm">Dưới 1 năm</Option>
          <Option value="1 năm">1 năm</Option>
          <Option value="2 năm">2 năm</Option>
          <Option value="3 năm">3 năm</Option>
          <Option value="Trên 3 năm">Trên 3 năm</Option>
        </Select>
        <Select
          value={education}
          onChange={(value) => setEducation(value)}
          placeholder="Trình độ học vấn"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <Option value={null}>Tất cả</Option>
          <Option value="Trung học">Trung học</Option>
          <Option value="Cao đẳng">Cao đẳng</Option>
          <Option value="Đại học">Đại học</Option>
          <Option value="Thạc sĩ">Thạc sĩ</Option>
          <Option value="Tiến sĩ">Tiến sĩ</Option>
        </Select>
        <Select
          value={position}
          onChange={(value) => setPosition(value)}
          placeholder="Vị trí"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <Option value={null}>Tất cả</Option>
          <Option value="Nhân viên">Nhân viên</Option>
          <Option value="Trưởng phòng">Trưởng phòng</Option>
          <Option value="Giám đốc">Giám đốc</Option>
        </Select>
        <Select
          value={workTime}
          onChange={(value) => setWorkTime(value)}
          placeholder="Thời gian làm việc"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <Option value={null}>Tất cả</Option>
          <Option value="Toàn thời gian">Toàn thời gian</Option>
          <Option value="Bán thời gian">Bán thời gian</Option>
          <Option value="Thực tập">Thực tập</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default JobSearchBar;
