import React from "react";
import FeatureCard from "./FeatureCard";

const FeatureSection = ({ features }) => {
  return (
    <div className="feature-section">
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
};

export default FeatureSection;
