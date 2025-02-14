import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Các trang dùng chung (Public)
import HomePage from "./pages/Homepage";

import JobDetailPage from "./pages/JobDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";

// Các trang riêng theo vai trò
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import CandidateDashboard from "./pages/candidate/candidate.jsx";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Các trang dùng chung */}
        <Route path="/" element={<HomePage />} />
        <Route path="/job/:id" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forget-password" element={<ForgetPasswordPage />} />
        <Route path="/company/:id" element={<CompanyDetailPage />} />

        {/* Các trang riêng theo vai trò */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/employer/*" element={<EmployerDashboard />} />
        <Route path="/candidate/*" element={<CandidateDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
