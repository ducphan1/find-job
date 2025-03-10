import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faBuilding,
  faBriefcase,
  faCoins,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { message } from "antd"; // Thêm message từ antd
import "../styles/JobListings.css";
import JobDetailModal from "./JobDetailModal";

const JobCard = ({ job, latest, onJobSelect }) => {
  if (!job) return null;

  if (latest) {
    return (
      <div
        className="latest-job-card"
        onClick={() => onJobSelect(job, job.company)}
      >
        <div className="latest-job-col-left">
          <img
            src={job.company?.logo || "/default-logo.png"}
            alt="Company Logo"
            className="latest-job-logo"
            onError={(e) => (e.target.src = "/default-logo.png")}
          />
        </div>
        <div className="latest-job-col-right">
          <div className="latest-job-row1">
            <h3 className="latest-job-title">
              {job.title || "Không xác định"}
            </h3>
            <p className="latest-job-company">
              {job.company?.name || "Không xác định"}
            </p>
          </div>
          <div className="latest-job-row2">
            <span className="latest-job-salary">
              <FontAwesomeIcon icon={faCoins} /> {job.salary || "Thỏa thuận"}{" "}
              VND
            </span>
            <span className="latest-job-deadline">
              <FontAwesomeIcon icon={faCalendar} />{" "}
              {job.createdAt
                ? new Date(job.createdAt).toLocaleDateString()
                : "Không rõ"}
            </span>
            <span className="latest-job-location">
              <FontAwesomeIcon icon={faBuilding} /> {job.location || "Không rõ"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(job.jobs)) return null;

  return (
    <div className="job-card">
      <div className="job-header">
        <img
          src={job.logo || "/default-logo.png"}
          alt="Company Logo"
          className="job-logo"
          onError={(e) => (e.target.src = "/default-logo.png")}
        />
        <div className="job-info">
          <h3 className="job-company">
            <Link to={`/company/${job._id}`}>{job.name}</Link>
          </h3>
          <p className="job-address">{job.address || "Không có địa chỉ"}</p>
          <div className="job-meta">
            <span>
              <FontAwesomeIcon icon={faBuilding} />{" "}
              {job.type || "Không xác định"}
            </span>
            <span>
              <FontAwesomeIcon icon={faBriefcase} /> {job.size || "Không rõ"}
            </span>
          </div>
        </div>
      </div>
      <div className="job-list">
        {job.jobs.map(
          (jobItem) =>
            jobItem && (
              <div
                key={jobItem._id}
                className="job-item"
                onClick={() => onJobSelect(jobItem, job)}
              >
                <span className="job-title">{jobItem.title || "Không rõ"}</span>
                <span className="job-salary">
                  <FontAwesomeIcon icon={faCoins} />{" "}
                  {jobItem.salary || "Thỏa thuận"}
                </span>
                <span className="job-deadline">
                  <FontAwesomeIcon icon={faCalendar} />{" "}
                  {jobItem.deadline || "Không rõ"}
                </span>
              </div>
            )
        )}
      </div>
    </div>
  );
};

const BestJobs = ({ jobs, onJobSelect }) => (
  <div className="best-jobs">
    <h2 className="section-title">CÔNG TY NỔI BẬT</h2>
    <div className="jobs-list">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} onJobSelect={onJobSelect} />
      ))}
    </div>
  </div>
);

const LatestJobs = ({ jobs, onJobSelect }) => (
  <div className="latest-jobs">
    <h2 className="section-title1">CÔNG VIỆC MỚI NHẤT</h2>
    <div className="latest-jobs-cards">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} latest onJobSelect={onJobSelect} />
      ))}
    </div>
  </div>
);

const JobListings = () => {
  const [bestCompanies, setBestCompanies] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null); // Thêm state cho WebSocket

  // Khởi tạo WebSocket
  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`ws://localhost:5000?token=${token || ""}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected in JobListings");
    };

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      console.log("Received WebSocket notification:", notification);

      // Hiển thị thông báo
      if (notification.type === "job_created") {
        message.success(notification.message);
        // Tự động cập nhật danh sách công việc mới nhất
        setLatestJobs((prevJobs) => [
          notification.job,
          ...prevJobs.slice(0, 4),
        ]);
      } else if (
        notification.type === "application_accepted" ||
        notification.type === "application_rejected"
      ) {
        message.info(notification.message);
      } else {
        message.info(notification.message);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    // Cleanup khi component unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/companies/featured").then((res) =>
        res.json()
      ),
      fetch("http://localhost:5000/api/jobs/latest").then((res) => res.json()),
    ])
      .then(([companiesData, jobsData]) => {
        setBestCompanies(Array.isArray(companiesData) ? companiesData : []);
        setLatestJobs(Array.isArray(jobsData) ? jobsData : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleJobSelect = (jobItem, company) => {
    setSelectedJob(jobItem);
    setSelectedCompany(company);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedJob(null);
    setSelectedCompany(null);
  };

  // Callback để truyền vào JobDetailModal
  const openModal = (job, company) => {
    setSelectedJob(job);
    setSelectedCompany(company);
    setModalVisible(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="job-listings">
      <div className="best-jobs-container">
        <BestJobs jobs={bestCompanies} onJobSelect={handleJobSelect} />
      </div>
      <div className="latest-jobs-container">
        <LatestJobs jobs={latestJobs} onJobSelect={handleJobSelect} />
      </div>
      {modalVisible && selectedJob && selectedCompany && (
        <JobDetailModal
          visible={modalVisible}
          onCancel={handleModalClose}
          initialJob={selectedJob} // Đổi từ job/company thành initialJob
          setOpenModal={(fn) => (openModal.current = fn)} // Truyền callback
        />
      )}
    </div>
  );
};

export default JobListings;
