import React from "react";
import "../styles/FeaturedCompanies.css";

import logo1 from "../assets/tkglogo.jpg";
import logo2 from "../assets/fpt.jpg";
import logo3 from "../assets/vutinh.jpg";
import logo4 from "../assets/ict.png";
import logo5 from "../assets/sps.jpg";
import logo6 from "../assets/nous.jpg";
import logo7 from "../assets/sis.png";
import logo8 from "../assets/cong-ty-tnhh-dego-holding2371722998736.jpg";
import logo9 from "../assets/fruit.png";
import logo10 from "../assets/cr.png";

const companies = [
  { id: 1, name: "TAKAWANG Can Tho", logo: logo1, jobs: 7 },
  { id: 2, name: "FPT Education Career", logo: logo2, jobs: 10 },
  { id: 3, name: "Vũ Tịnh", logo: logo3, jobs: 9 },
  { id: 4, name: "ICT", logo: logo4, jobs: 2 },
  { id: 5, name: "SPIS", logo: logo5, jobs: 1 },
  { id: 6, name: "Công ty A", logo: logo6, jobs: 4 },
  { id: 7, name: "Công ty B", logo: logo7, jobs: 20 },
  { id: 8, name: "Công ty C", logo: logo8, jobs: 11 },
  { id: 9, name: "Công ty D", logo: logo9, jobs: 4 },
  { id: 10, name: "Công ty E", logo: logo10, jobs: 5 },
];

const FeaturedCompanies = () => {
  return (
    <div className="featured-companies">
      <h2 className="section-title2">CÔNG TY NỔI BẬT</h2>
      <div className="companies-grid">
        {companies.map((company) => (
          <div key={company.id} className="company-card">
            <img src={company.logo} alt={company.name} />
            <p>📂 {company.jobs} vị trí đang tuyển</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCompanies;
