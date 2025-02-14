import React from "react";
import { Button } from "antd";

const RecruiterSlide = ({ recruiter }) => {
  const half = Math.ceil(recruiter.jobs.length / 2);
  return (
    <div className="recruiter-slide">
      <img
        src={recruiter.image}
        alt={recruiter.company}
        className="recruiter-image"
      />
      <div className="recruiter-info">
        <img src={recruiter.logo} alt="logo" className="recruiter-logo" />

        <div className="recruiter-job-info">
          <div className="job-list-columns">
            <ul className="job-column">
              {recruiter.jobs.slice(0, half).map((job, index) => (
                <li key={index}>{job}</li>
              ))}
            </ul>
            <ul className="job-column">
              {recruiter.jobs.slice(half).map((job, index) => (
                <li key={index}>{job}</li>
              ))}
            </ul>
          </div>
        </div>
        <Button className="recruiter-btn" type="primary">
          Xem thêm
        </Button>
      </div>
    </div>
  );
};

export default RecruiterSlide;
