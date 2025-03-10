import React, { useState, useEffect } from "react"; // Thêm useState, useEffect
import { Button, message } from "antd"; // Thêm message
import { io } from "socket.io-client"; // Thêm socket.io-client

const RecruiterSlide = ({ slide }) => {
  const [jobs, setJobs] = useState(slide.jobs); // State để cập nhật jobs
  const [socket, setSocket] = useState(null); // State cho Socket.IO

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
      console.log("Socket.IO connected in RecruiterSlide");
    });

    socket.on("notification", (notification) => {
      console.log("Received Socket.IO notification:", notification);
      if (
        notification.type === "job_created" &&
        notification.job.companyId === slide._id
      ) {
        message.success(`${notification.message} Công việc mới đã được thêm!`);
        setJobs((prevJobs) => [...prevJobs, notification.job.title]);
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
  }, [slide._id]); // Dependency là slide._id để kiểm tra công ty cụ thể

  const half = Math.ceil(jobs.length / 2);

  return (
    <div className="recruiter-slide">
      <img
        src={slide.backgroundImage}
        alt={slide.title}
        className="recruiter-image"
      />
      <div className="recruiter-info">
        <img src={slide.logo} alt="logo" className="recruiter-logo" />
        <div className="recruiter-job-info">
          <div className="job-list-columns">
            <ul className="job-column">
              {jobs.slice(0, half).map((job, index) => (
                <li key={index}>{job}</li>
              ))}
            </ul>
            <ul className="job-column">
              {jobs.slice(half).map((job, index) => (
                <li key={index}>{job}</li>
              ))}
            </ul>
          </div>
        </div>
        <Button className="recruiter-btn" type="primary" href={slide.link}>
          Xem thêm
        </Button>
      </div>
    </div>
  );
};

export default RecruiterSlide;
