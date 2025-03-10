import React, { useState, useEffect } from "react"; // Thêm useState, useEffect
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { message } from "antd"; // Thêm message
import { io } from "socket.io-client"; // Thêm socket.io-client

const RecruiterCarousel = ({ slides }) => {
  const [socket, setSocket] = useState(null); // State cho Socket.IO
  const [carouselSlides, setCarouselSlides] = useState(slides); // State để cập nhật slides

  console.log("Slides in RecruiterCarousel:", carouselSlides);

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
      console.log("Socket.IO connected in RecruiterCarousel");
    });

    socket.on("notification", (notification) => {
      console.log("Received Socket.IO notification:", notification);
      if (notification.type === "job_created") {
        message.success(`${notification.message} Carousel đã được cập nhật!`);
        // Giả sử job mới có liên quan đến một slide (cần logic từ backend để xác định)
        setCarouselSlides((prevSlides) => {
          const updatedSlide = prevSlides.find(
            (slide) => slide._id === notification.job.companyId // Ví dụ: companyId từ job
          );
          if (updatedSlide) {
            updatedSlide.jobs = [...updatedSlide.jobs, notification.job.title];
            return [...prevSlides];
          }
          return prevSlides;
        });
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
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    appendDots: (dots) => (
      <div>
        <ul className="custom-dots">{dots}</ul>
      </div>
    ),
    customPaging: (i) => <button>{i + 1}</button>,
  };

  if (!carouselSlides || carouselSlides.length === 0) {
    return <div>Không có slide để hiển thị</div>;
  }

  return (
    <Slider {...settings} className="slick-slider">
      {carouselSlides.map((slide) => (
        <div key={slide._id} className="recruiter-slide">
          <img
            src={slide.backgroundImage}
            alt={slide.title}
            className="recruiter-image"
          />
          <div className="recruiter-info">
            <img src={slide.logo} alt="Logo" className="recruiter-logo" />
            <div className="recruiter-job-info">
              <h3>{slide.title}</h3>
              <div className="job-list-columns">
                {slide.jobs && slide.jobs.length > 0 ? (
                  <ul className="job-column">
                    {slide.jobs.map((job, index) => (
                      <li key={index}>{job}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Không có công việc nào</p>
                )}
              </div>
            </div>
            {slide.link && (
              <a href={slide.link} className="recruiter-btn">
                Xem thêm
              </a>
            )}
          </div>
        </div>
      ))}
    </Slider>
  );
};

export default RecruiterCarousel;
