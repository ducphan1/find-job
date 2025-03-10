import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  EnvironmentOutlined,
  MoneyCollectOutlined,
  CalendarOutlined,
  HeartOutlined,
  SortAscendingOutlined,
  FireOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import "../styles/JobListings1.css";
import PublicLayout from "../layout/PublicLayout.js";
import JobDetailModal from "../components/JobDetailModal";

// Hàm làm sạch HTML để chỉ lấy text
const cleanHtml = (html) => {
  if (!html) return "Chưa cập nhật";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getSalaryLabel = (salaryNum) => {
  if (!salaryNum || salaryNum < 0) return "Thỏa thuận";
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

const JobListings = () => {
  const location = useLocation();
  const initialFilteredJobs = location.state?.filteredJobs || [];
  const searchParams = location.state?.searchParams || {};

  const [jobs, setJobs] = useState(initialFilteredJobs);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { title: keyword, category, location: searchLocation } = searchParams;

  const resultCount = jobs.length;
  const categoryText = category || "Tất cả ngành nghề";
  const keywordText = keyword ? `${keyword} - ` : "";
  const locationText = searchLocation || "Tất cả địa điểm";
  const searchTitle = `Tìm thấy ${resultCount} việc làm ${categoryText} ${keywordText}tại ${locationText} mới nhất 2025`;

  const handleSort = (sortType) => {
    console.log(`Sort by: ${sortType}`);
  };

  const [filters, setFilters] = useState({
    salary: [],
    position: [], // Thay level thành position
    workTime: [],
    experience: [],
    time: [],
    education: [],
  });

  const filterOptions = {
    salary: [
      "Thỏa thuận",
      "Dưới 3 triệu",
      "3 - 5 triệu",
      "5 - 7 triệu",
      "7 - 10 triệu",
      "10 - 12 triệu",
      "12 - 15 triệu",
      "15 - 20 triệu",
      "20 - 25 triệu",
      "25 - 30 triệu",
      "Trên 30 triệu",
    ],
    position: [
      // Thay level thành position
      "Nhân viên",
      "Sinh viên",
      "Trưởng nhóm",
      "Quản lý",
      "Điều hành cấp cao",
    ],
    workTime: [
      "Toàn thời gian",
      "Bán thời gian/ Thời vụ",
      "Thực tập",
      "Remote - Làm việc từ xa",
      "Khác",
    ],
    experience: [
      "Không yêu cầu",
      "Dưới 1 năm",
      "1 năm",
      "2 năm",
      "3 năm",
      "4 năm",
      "5 năm",
      "Trên 5 năm",
    ],
    time: ["24h giờ qua", "7 ngày qua", "14 ngày qua", "30 ngày qua"],
    education: [
      "Không yêu cầu",
      "Trên đại học",
      "Đại học",
      "Cao đẳng",
      "Trung cấp",
      "Chứng chỉ nghề",
      "Phổ thông",
    ],
  };

  const handleFilterChange = async (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(
          (v) => v !== value
        );
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      fetchFilteredJobs(newFilters);
      return newFilters;
    });
  };

  const fetchFilteredJobs = async (filters) => {
    try {
      const params = new URLSearchParams();
      if (searchParams.title) params.append("title", searchParams.title);
      if (searchParams.category)
        params.append("category", searchParams.category);
      if (searchParams.location)
        params.append("location", searchParams.location);
      if (filters.salary.length > 0)
        params.append("salary", filters.salary.join(","));
      if (filters.position.length > 0)
        // Thay level thành position
        params.append("position", filters.position.join(","));
      if (filters.workTime.length > 0)
        params.append("workTime", filters.workTime.join(","));
      if (filters.experience.length > 0)
        params.append("experience", filters.experience.join(","));
      if (filters.time.length > 0)
        params.append("time", filters.time.join(","));
      if (filters.education.length > 0)
        params.append("education", filters.education.join(","));

      const response = await axios.get(`/api/jobs/search?${params.toString()}`);
      setJobs(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lọc công việc:", error);
      setJobs([]);
    }
  };

  useEffect(() => {
    // Có thể gọi API để lấy danh sách bộ lọc từ server nếu cần
  }, []);

  return (
    <PublicLayout>
      <div className="job-listings-container1">
        <div className="job-list1">
          <div className="search-result-header1">
            <h2>{searchTitle}</h2>
            <div className="sort-options1">
              <span>Sắp xếp theo:</span>
              <button
                className="sort-button1 active"
                onClick={() => handleSort("date_updated")}
              >
                <SortAscendingOutlined /> Ngày cập nhật
              </button>
              <button
                className="sort-button1"
                onClick={() => handleSort("date_posted")}
              >
                <SortAscendingOutlined /> Ngày đăng
              </button>
              <button
                className="sort-button1"
                onClick={() => handleSort("hot")}
              >
                <FireOutlined /> Hot nhất
              </button>
              <button
                className="sort-button1"
                onClick={() => handleSort("salary")}
              >
                <DollarOutlined /> Lương cao
              </button>
              <button
                className="sort-button1"
                onClick={() => handleSort("match")}
              >
                <CheckCircleOutlined /> Phù hợp
              </button>
            </div>
          </div>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div
                key={job._id}
                className="job-card1"
                onClick={() => {
                  setSelectedJob(job);
                  setModalVisible(true);
                }}
              >
                <img
                  src={job.company?.logo || "/default-logo.png"}
                  alt={job.company?.name || "Company"}
                  className="company-logo1"
                />
                <div className="job-details1">
                  <h3>{job.title}</h3>
                  <p>{job.company?.name || "Không xác định"}</p>
                  <p>
                    <MoneyCollectOutlined className="icon1" />{" "}
                    {getSalaryLabel(job.salary) || "Thỏa thuận"}
                  </p>
                  <p>
                    <EnvironmentOutlined className="icon1" />{" "}
                    {cleanHtml(job.location) || "Không xác định"}
                  </p>
                  <p>
                    <CalendarOutlined className="icon1" />{" "}
                    {job.deadline
                      ? moment.unix(job.deadline).format("DD-MM-YYYY")
                      : "Không xác định"}
                  </p>
                </div>
                <HeartOutlined className="heart-icon1" />
              </div>
            ))
          ) : (
            <div className="no-jobs-message1">
              <h2>Không có công việc phù hợp</h2>
              <p>Vui lòng thử lại với các tiêu chí tìm kiếm khác.</p>
            </div>
          )}
        </div>
        <div className="sidebar1">
          <div className="filter-category1">
            <h4>LỌC THEO MỨC LƯƠNG</h4>
            <div className="filter-options1">
              {filterOptions.salary.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={filters.salary.includes(option)}
                    onChange={() => handleFilterChange("salary", option)}
                  />{" "}
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-category1">
            <h4>LỌC THEO CẤP BẬC</h4>
            <div className="filter-options1">
              {filterOptions.position.map(
                (
                  option // Thay level thành position
                ) => (
                  <label key={option}>
                    <input
                      type="checkbox"
                      checked={filters.position.includes(option)} // Thay level thành position
                      onChange={() => handleFilterChange("position", option)} // Thay level thành position
                    />{" "}
                    {option}
                  </label>
                )
              )}
            </div>
          </div>
          <div className="filter-category1">
            <h4>LỌC THEO LOẠI HÌNH</h4>
            <div className="filter-options1">
              {filterOptions.workTime.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={filters.workTime.includes(option)}
                    onChange={() => handleFilterChange("workTime", option)}
                  />{" "}
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-category1">
            <h4>LỌC THEO KINH NGHIỆM</h4>
            <div className="filter-options1">
              {filterOptions.experience.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={filters.experience.includes(option)}
                    onChange={() => handleFilterChange("experience", option)}
                  />{" "}
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-category1">
            <h4>LỌC THEO THỜI GIAN</h4>
            <div className="filter-options1">
              {filterOptions.time.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={filters.time.includes(option)}
                    onChange={() => handleFilterChange("time", option)}
                  />{" "}
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="filter-category1">
            <h4>LỌC THEO TRÌNH ĐỘ</h4>
            <div className="filter-options1">
              {filterOptions.education.map((option) => (
                <label key={option}>
                  <input
                    type="checkbox"
                    checked={filters.education.includes(option)}
                    onChange={() => handleFilterChange("education", option)}
                  />{" "}
                  {option}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <JobDetailModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        initialJob={selectedJob}
      />
    </PublicLayout>
  );
};

export default JobListings;
