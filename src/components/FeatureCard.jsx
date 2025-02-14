import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FeatureCard = ({ feature }) => {
  return (
    <div className="feature">
      <FontAwesomeIcon icon={feature.icon} className="feature-icon" />
      <h3 className="feature-title">{feature.title}</h3>
      {feature.desc && <p className="feature-description">{feature.desc}</p>}
    </div>
  );
};

export default FeatureCard;
