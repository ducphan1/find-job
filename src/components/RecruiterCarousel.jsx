import React from "react";
import { Carousel } from "antd";
import RecruiterSlide from "./RecruiterSlide";

const RecruiterCarousel = ({ recruiters }) => {
  return (
    <div className="carousel-container">
      <Carousel autoplay dots={{ className: "custom-dots" }}>
        {recruiters.map((item) => (
          <RecruiterSlide key={item.id} recruiter={item} />
        ))}
      </Carousel>
    </div>
  );
};

export default RecruiterCarousel;
