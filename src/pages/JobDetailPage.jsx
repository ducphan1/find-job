import React from "react";
import PublicLayout from "../layout/PublicLayout";
import "../styles/JobDetailPage.css";

const JobDetailPage = ({ params }) => {
  const jobId = params?.id || 1;
  const job = {
    id: jobId,
    title: "Frontend Developer",
    company: "Công ty ABC",
    location: "Cần Thơ",
    salary: "10-15 triệu",
    description: "Mô tả chi tiết công việc, yêu cầu và quyền lợi của ứng viên.",
  };

  return (
    <PublicLayout>
      <div className="job-detail-page">
        <div className="container">
          <h2>{job.title}</h2>
          <p>
            <strong>Công ty:</strong> {job.company}
          </p>
          <p>
            <strong>Địa điểm:</strong> {job.location}
          </p>
          <p>
            <strong>Lương:</strong> {job.salary}
          </p>
          <div className="job-description">
            <p>{job.description}</p>
          </div>
          <button className="btn-apply">Ứng tuyển ngay</button>
        </div>
      </div>
    </PublicLayout>
  );
};

export default JobDetailPage;
