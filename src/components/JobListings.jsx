import React, { useState, useEffect, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faBuilding,
  faCoins,
  faCalendar,
  faHeart,
  faUsers,
  faIndustry,
  faArrowDown,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { message } from "antd";
import { io } from "socket.io-client"; // Thêm socket.io-client
import "../styles/JobListings.css";
import JobDetailModal from "./JobDetailModal";

// Helper function to format salary and date
const formatSalary = (salaryNum) => {
  if (!salaryNum || salaryNum < 0) return "Thỏa thuận";
  if (salaryNum <= 5000000) return "Dưới 5 triệu";
  if (salaryNum <= 10000000) return "5 - 10 triệu";
  if (salaryNum <= 12000000) return "10 - 12 triệu";
  if (salaryNum <= 15000000) return "12 - 15 triệu";
  if (salaryNum >= 20000000) return "Trên 15 triệu";
  return "Thỏa thuận";
};

const formatDate = (timestamp) => {
  if (!timestamp) return "Không rõ";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds} giây trước`;
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const JobCard = ({ job, latest, onJobSelect, companyJobs = [] }) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  if (!job) return null;

  if (latest) {
    return (
      <div
        className="latest-job-card"
        onClick={() => onJobSelect(job, job.company)}
      >
        <div className="job-left-column">
          <img
            src={job.company?.logo || "/default-logo.png"}
            alt="Company Logo"
            className="job-logo-small"
            onError={(e) => (e.target.src = "/default-logo.png")}
          />
        </div>
        <div className="job-right-column">
          <div className="latest-job-details">
            <div className="latest-job-info">
              <h4 className="latest-job-title">
                {job.title || "Không xác định"}
              </h4>
              <p className="latest-job-company">
                {job.company?.name || "Không xác định"}
              </p>
              <div className="latest-job-meta">
                <p>
                  <FontAwesomeIcon icon={faCoins} />{" "}
                  {formatSalary(job.salary) || "Không rõ"}
                </p>
                <p>
                  <FontAwesomeIcon icon={faCalendar} />{" "}
                  {formatDate(job.posted || job.deadline) || "Không rõ"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const visibleJobs = companyJobs.slice(0, 4);
  const hasMoreJobs = companyJobs.length > 4;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => setIsLoadingMore(false), 2000);
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <img
          src={job.logo || "/default-logo.png"}
          alt="Company Logo"
          className="job-logo"
          onError={(e) => (e.target.src = "/default-logo.png")}
        />
        <div className="job-info1">
          <h3 className="job-company">
            <Link to={`/company/${job._id}`}>{job.name}</Link>
          </h3>
          <p className="job-address">{job.address || "Không có địa chỉ"}</p>
          <div className="job-meta">
            <span>
              <FontAwesomeIcon icon={faUsers} /> {job.size || "Không rõ"}
            </span>
            <span>
              <FontAwesomeIcon icon={faBuilding} /> {job.type || "Không rõ"}
            </span>
            <span>
              <FontAwesomeIcon icon={faIndustry} /> {job.industry || "Không rõ"}
            </span>
          </div>
        </div>
      </div>
      <div className="job-list">
        {visibleJobs.map((jobItem) => (
          <div
            key={jobItem._id}
            className="job-entry"
            onClick={() => onJobSelect(jobItem, job)}
          >
            <div className="job-left-column1">
              <FontAwesomeIcon icon={faHeart} className="heart-icon" />
            </div>
            <div className="job-right-column">
              <div className="job-details">
                <h4 className="job-title">
                  {jobItem.title || "Không xác định"}
                </h4>
                <div className="job-meta-inline">
                  <p>
                    <FontAwesomeIcon icon={faCoins} />{" "}
                    {formatSalary(jobItem.salary) || "Không rõ"}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faCalendar} />{" "}
                    {formatDate(jobItem.date) || "Không rõ"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasMoreJobs && (
        <div className="job-footer">
          <button
            onClick={handleLoadMore}
            className="view-more-button"
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <>
                Xem thêm {companyJobs.length - 4} vị trí khác{" "}
                <FontAwesomeIcon icon={faArrowDown} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const JobListings = () => {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null); // State cho Socket.IO
  const latestJobsRef = useRef(null);

  // Khởi tạo Socket.IO
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found, skipping Socket.IO connection");
      return;
    }

    const socket = io("http://localhost:5000", {
      query: { token }, // Gửi token qua query
      reconnection: true, // Tự động thử kết nối lại nếu mất kết nối
      reconnectionAttempts: 5, // Số lần thử kết nối lại
    });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Socket.IO connected successfully");
    });

    socket.on("notification", (notification) => {
      console.log("Received Socket.IO notification:", notification);
      if (notification.type === "job_created") {
        message.success(notification.message);
        setJobs((prevJobs) =>
          prevJobs.some((j) => j._id === notification.job._id)
            ? prevJobs
            : [notification.job, ...prevJobs]
        );
      } else if (
        notification.type === "application_accepted" ||
        notification.type === "application_rejected"
      ) {
        message.info(notification.message);
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

    // Cleanup khi component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchCompanies = fetch("http://localhost:5000/api/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => setCompanies([]));

    const fetchJobs = fetch("http://localhost:5000/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]));

    Promise.all([fetchCompanies, fetchJobs])
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Xử lý hiệu ứng scroll cho "Việc Làm Mới Nhất"
  useEffect(() => {
    const container = latestJobsRef.current;
    if (!container) return;

    const handleScroll = () => {
      const titleHeight =
        container.querySelector(".section-title1").offsetHeight;
      const jobCards = container.querySelectorAll(".latest-job-card");

      jobCards.forEach((card) => {
        const cardTop =
          card.getBoundingClientRect().top -
          container.getBoundingClientRect().top;
        if (cardTop <= titleHeight) {
          card.style.opacity = "0";
        } else {
          card.style.opacity = "1";
        }
      });
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [jobs]);

  const companyJobsMap = useMemo(() => {
    return jobs.reduce((acc, job) => {
      const companyId = job.company?._id;
      if (!acc[companyId]) {
        acc[companyId] = [];
      }
      acc[companyId].push(job);
      return acc;
    }, {});
  }, [jobs]);

  const handleJobSelect = (jobItem, company) => {
    if (!jobItem || !company || !company._id) {
      console.error("Dữ liệu công việc hoặc công ty không hợp lệ:", {
        jobItem,
        company,
      });
      return;
    }
    console.log("Công việc được chọn:", jobItem);
    console.log("Công ty của công việc:", company);
    setSelectedJob(jobItem);
    setSelectedCompany(company);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedJob(null);
    setSelectedCompany(null);
  };

  const openModal = (job, company) => {
    setSelectedJob(job);
    setSelectedCompany(company);
    setModalVisible(true);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="job-listings">
      <div className="best-jobs-container">
        <h2 className="section-title">Việc Làm Tốt Nhất</h2>
        <div className="jobs-list">
          {companies.map((company) => (
            <JobCard
              key={company._id}
              job={company}
              companyJobs={companyJobsMap[company._id] || []}
              onJobSelect={handleJobSelect}
            />
          ))}
        </div>
      </div>
      <div className="latest-jobs-container" ref={latestJobsRef}>
        <h2 className="section-title1">Việc Làm Mới Nhất</h2>
        <div className="latest-jobs-cards">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              latest
              onJobSelect={handleJobSelect}
            />
          ))}
        </div>
      </div>
      {modalVisible && selectedJob && selectedCompany && (
        <JobDetailModal
          visible={modalVisible}
          onCancel={handleModalClose}
          initialJob={selectedJob}
          setOpenModal={(fn) => (openModal.current = fn)}
        />
      )}
    </div>
  );
};

export default JobListings;
