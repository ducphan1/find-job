import React from "react";
import Topbar from "./Topbar";
import "../styles/Header.css";
import JobSearchBar from "./JobSearchBar";
import NavBar from "./Navbar";

const Header = () => {
  return (
    <header className="site-header">
      <Topbar />
      <NavBar />
      <JobSearchBar />
    </header>
  );
};

export default Header;
