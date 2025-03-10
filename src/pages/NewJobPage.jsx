import React, { useState } from "react";
import SidebarFilter from "../components/SidebarFilter";
import JobList from "../components/JobList";
import Pagination from "../components/Pagination";
import "../styles/NewJobPage.css";
import PublicLayout from "../layout/PublicLayout.js";

// Data: Gồm 10 công ty (latestCompanies)
import { companies } from "../data/latestCompanies";

const NewJobPage = () => {
  // 1) Gộp (flatten) tất cả job từ data
  const allJobs = [];
  companies.forEach((c) => {
    c.jobs.forEach((job) => {
      allJobs.push({
        ...job,
        companyName: c.name,
        logo: c.logo,
      });
    });
  });

  // 2) Lưu allJobs trong state (nếu muốn dynamic)
  const [jobs, setJobs] = useState(allJobs);

  // 3) Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const indexOfLastJob = currentPage * jobsPerPage; // page1 => 10, page2 => 20
  const indexOfFirstJob = indexOfLastJob - jobsPerPage; // page1 => 0,  page2 => 10
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  return (
    <div className="newjob-wrapper">
      <PublicLayout>
        <div className="newjob-container">
          <div className="newjob-content">
            {/* Cột bên trái: danh sách việc làm + phân trang */}
            <div className="job-list-container">
              <JobList jobs={currentJobs} />
              <Pagination
                totalJobs={jobs.length} // Tổng số job
                jobsPerPage={jobsPerPage} // 10 job / trang
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>

            {/* Cột bên phải: Sidebar lọc */}
            <SidebarFilter />
          </div>
        </div>
      </PublicLayout>
    </div>
  );
};

export default NewJobPage;
