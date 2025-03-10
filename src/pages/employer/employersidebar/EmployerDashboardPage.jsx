import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import "../../../styles/EmployerDashboardPage.css";

// Hàm làm sạch HTML từ chuỗi
const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EmployerDashboardPage = () => {
  const { socket } = useOutletContext();
  const [stats, setStats] = useState({
    openCampaigns: 0,
    receivedCVs: 0,
    displayedJobs: 0,
    newApplications: 0,
  });
  const [jobs, setJobs] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const chartData = {
    labels: ["Chiến dịch mở", "CV tiếp nhận", "Tin hiển thị", "CV mới"],
    datasets: [
      {
        label: "Thống kê tuyển dụng",
        data: [
          stats.openCampaigns,
          stats.receivedCVs,
          stats.displayedJobs,
          stats.newApplications,
        ],
        backgroundColor: ["#1890ff", "#52c41a", "#faad14", "#f5222d"],
        borderColor: ["#0050b3", "#389e0d", "#d48806", "#cf1322"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Hiệu quả tuyển dụng" },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Số lượng" } },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      console.log("Token gửi từ frontend:", token);

      if (!token) {
        console.log("Không có token trong localStorage");
        return;
      }

      try {
        console.log("Gọi API stats:", `${API_URL}/companies/stats`);
        const statsResponse = await axios.get(`${API_URL}/companies/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Dữ liệu thống kê từ server:", statsResponse.data);
        setStats({
          openCampaigns: statsResponse.data.openCampaigns || 0,
          receivedCVs: statsResponse.data.receivedCVs || 0,
          displayedJobs: statsResponse.data.displayedJobs || 0,
          newApplications: statsResponse.data.newApplications || 0,
        });

        console.log("Gọi API jobs:", `${API_URL}/jobs/my-jobs`);
        const jobsResponse = await axios.get(`${API_URL}/jobs/my-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Danh sách công việc:", jobsResponse.data);
        setJobs(jobsResponse.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.response?.data || error);
      }
    };

    fetchData();

    if (socket) {
      socket.on("notification", (data) => {
        if (data.type === "application_added") {
          setStats((prev) => ({
            ...prev,
            receivedCVs: prev.receivedCVs + 1,
            newApplications: prev.newApplications + 1,
          }));
        } else if (data.type === "job_updated") {
          setStats((prev) => ({
            ...prev,
            displayedJobs: data.job.visible
              ? prev.displayedJobs + 1
              : prev.displayedJobs - 1,
          }));
          setJobs((prev) =>
            prev.map((job) =>
              job._id === data.job._id
                ? { ...job, visible: data.job.visible }
                : job
            )
          );
        }
      });
    }

    return () => {
      if (socket) socket.off("notification");
    };
  }, [socket, API_URL]);

  return (
    <div className="employer-dashboard-page">
      <h2>Bảng tin nhà tuyển dụng</h2>
      <div className="dashboard-row">
        <div className="left-col">
          <div className="recruitment-square">
            <Bar data={chartData} options={chartOptions} />
            <div className="action-button">
              <button>Quản lý chiến dịch tuyển dụng</button>
            </div>
          </div>
        </div>
        <div className="right-col">
          <div className="work-box">
            <h3>Công việc đang tuyển</h3>
            {jobs.length > 0 ? (
              <ul className="job-list">
                {jobs
                  .filter((job) => job.visible)
                  .slice(0, 5)
                  .map((job) => (
                    <li key={job._id} className="job-item">
                      <span className="job-title">{job.title}</span>
                      <span className="job-location">
                        {stripHtml(job.location || "Không xác định")}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>Chưa có công việc nào được đăng.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardPage;
