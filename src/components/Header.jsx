import React from "react";
import Topbar from "./Topbar";
import Navbar from "./Navbar";
import "../styles/Header.css";
import JobSearchBar from "./JobSearchBar";

const Header = () => {
  return (
    <header className="site-header">
      <Topbar />
      <Navbar />
      <JobSearchBar />
    </header>
  );
};

export default Header;
