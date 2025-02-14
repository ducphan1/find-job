import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faBuilding,
  faBriefcase,
  faCoins,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/JobListings.css";

import { bestCompanies } from "../data/bestcompanies";
import { latestCompanies } from "../data/latestCompanies";
import JobDetailModal from "./JobDetailModal";

const JobCard = ({ job, latest, onJobSelect }) => {
  if (latest) {
    const jobItem = job.jobs[0];
    return (
      <div
        className="latest-job-card"
        onClick={() => onJobSelect(jobItem, job)}
      >
        <div className="latest-job-col-left">
          <img src={job.logo} alt="Company Logo" className="latest-job-logo" />
        </div>
        <div className="latest-job-col-right">
          <div className="latest-job-row1">
            <h3 className="latest-job-title">{jobItem.title}</h3>
            <p className="latest-job-company">{job.company}</p>
          </div>
          <div className="latest-job-row2">
            <span className="latest-job-salary">
              <FontAwesomeIcon icon={faCoins} /> {jobItem.salary}
            </span>
            <span className="latest-job-deadline">
              <FontAwesomeIcon icon={faCalendar} /> {jobItem.deadline}
            </span>
            <span className="latest-job-location">
              <FontAwesomeIcon icon={faBuilding} />{" "}
              {jobItem.location || job.address}
            </span>
          </div>
        </div>
      </div>
    );
  } else {
    if (job.jobs && Array.isArray(job.jobs)) {
      return (
        <div className="job-card">
          <div className="job-header">
            <img src={job.logo} alt="Company Logo" className="job-logo" />
            <div className="job-info">
              <h3 className="job-company">
                <Link to={`/company/${job.id}`}>{job.company}</Link>
              </h3>
              <p className="job-address">{job.address}</p>
              <div className="job-meta">
                <span>
                  <FontAwesomeIcon icon={faBuilding} /> {job.type}
                </span>
                <span>
                  <FontAwesomeIcon icon={faBriefcase} /> {job.size}
                </span>
              </div>
            </div>
          </div>

          <div className="job-list">
            {job.jobs.map((jobItem, index) => (
              <div
                key={index}
                className="job-item"
                onClick={() => onJobSelect(jobItem, job)}
              >
                <span className="job-title">{jobItem.title}</span>
                <span className="job-salary">
                  <FontAwesomeIcon icon={faCoins} /> {jobItem.salary}
                </span>
                <span className="job-deadline">
                  <FontAwesomeIcon icon={faCalendar} /> {jobItem.deadline}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
};

const BestJobs = ({ jobs, onJobSelect }) => {
  return (
    <div className="best-jobs">
      <h2 className="section-title">CÔNG TY TỐT NHẤT</h2>
      <div className="jobs-list">
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} onJobSelect={onJobSelect} />
        ))}
      </div>
    </div>
  );
};

const LatestJobs = ({ jobs, onJobSelect }) => {
  return (
    <div className="latest-jobs">
      <h2 className="section-title1">CÔNG TY MỚI NHẤT</h2>
      <div className="latest-jobs-cards">
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} latest onJobSelect={onJobSelect} />
        ))}
      </div>
    </div>
  );
};

const JobListings = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

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

  return (
    <div className="job-listings">
      <div className="best-jobs-container">
        <BestJobs jobs={bestCompanies} onJobSelect={handleJobSelect} />
      </div>

      <div className="latest-jobs-container">
        <LatestJobs jobs={latestCompanies} onJobSelect={handleJobSelect} />
      </div>

      {modalVisible && selectedJob && selectedCompany && (
        <JobDetailModal
          visible={modalVisible}
          onCancel={handleModalClose}
          job={selectedJob}
          company={selectedCompany}
        />
      )}
    </div>
  );
};

export default JobListings;
