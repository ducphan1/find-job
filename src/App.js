import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import store from "./store";
import { loadUser } from "./actions/authActions";

import HomePage from "./pages/Homepage";
import JobDetailPage from "./pages/JobDetailPage";
import LoginPage from "./pages/LoginPage";

import CompanyDetailPage from "./pages/CompanyDetailPage";
import NewJobPage from "./pages/NewJobPage.jsx";

import EmployerLoginPage from "./pages/employer/EmployerLoginPage.jsx";
import UserLoginPage from "./pages/user/UserLoginPage.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage";
import EmployerRegisterPage from "./pages/employer/EmployerRegisterPage";
import UserRegisterPage from "./pages/user/UserRegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";

import EmployerDashboardLayout from "./pages/employer/employersidebar/EmployerDashboardLayout.jsx";
import EmployerDashboardPage from "./pages/employer/employersidebar/EmployerDashboardPage.jsx";
import EmployerJobsPage from "./pages/employer/employersidebar/EmployerJobsPage.jsx";
import EmployerCVPage from "./pages/employer/employersidebar/EmployerCVPage.jsx";
import EmployerSecurityPage from "./pages/employer/employersidebar/EmployerSecurityPage.jsx";
import EmployerNotificationsPage from "./pages/employer/employersidebar/EmployerNotificationsPage.jsx";
import EmployerHistoryPage from "./pages/employer/employersidebar/EmployerHistoryPage.jsx";
import EmployerJobManagementPage from "./pages/employer/employersidebar/EmployerJobManagementPage.jsx";
import EditCompanyPage from "./pages/employer/employersidebar/EditCompanyPage.jsx";

import UserDashboardLayout from "./pages/user/usersidebar/UserDashboardLayout.jsx";
import UserDashboardPage from "./pages/user/usersidebar/UserDashBoardPage.jsx";
import CandidateUpdatePage from "./pages/user/usersidebar/UserUpdatePage.jsx";
import AppliedJobsPage from "./pages/user/usersidebar/AppliedJobsPage.jsx";
import SavedJobsPage from "./pages/user/usersidebar/SavedJobsPage.jsx";
import SecurityPage from "./pages/user/usersidebar/SecurityPage.jsx";
import ViewProfilePage from "./pages/user/usersidebar/ViewProfilePage.jsx";

// Import Admin Dashboard và các trang con
import AdminDashboardLayout from "./pages/admin/adminsidebar/AdminDashboardLayout.jsx";
import AdminDashboardPage from "./pages/admin/adminsidebar/AdminDashboardPage.jsx";
import AdminUsersPage from "./pages/admin/adminsidebar/AdminUsersPage.jsx";
import AdminEmployersPage from "./pages/admin/adminsidebar/AdminEmployersPage.jsx";
import AdminJobsPage from "./pages/admin/adminsidebar/AdminJobsPage.jsx";
import AdminSlidesPage from "./pages/admin/adminsidebar/AdminSlidesPage.jsx";
import AdminSettingsPage from "./pages/admin/adminsidebar/AdminSettingsPage.jsx";
import AdminSecurityPage from "./pages/admin/adminsidebar/AdminSecurityPage.jsx";
import AdminNotificationsPage from "./pages/admin/adminsidebar/AdminNotificationsPage.jsx";

import "./App.css";
import JobListings from "./pages/JobListing.jsx";

const getUserRole = () => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  return loggedInUser ? loggedInUser.role : null;
};

const getToken = () => {
  return localStorage.getItem("token");
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = getUserRole();
  const token = getToken();
  console.log("ProtectedRoute - Token:", token, "Role:", role);

  if (!token) {
    const path = window.location.pathname;
    if (path.startsWith("/employer"))
      return <Navigate to="/employer/login" replace />;
    if (path.startsWith("/user")) return <Navigate to="/user/login" replace />;
    if (path.startsWith("/admin"))
      return <Navigate to="/admin/login" replace />;
    return <Navigate to="/" replace />;
  }

  if (!role) return <Navigate to="/" replace />;
  if (role === "employer" && !allowedRoles.includes("employer"))
    return <Navigate to="/employer/dashboard" replace />;
  if (role === "admin" && !allowedRoles.includes("admin"))
    return <Navigate to="/admin/dashboard" replace />;
  if (!allowedRoles.includes(role)) {
    return role === "user" ? (
      <Navigate to="/" replace />
    ) : (
      <Navigate to={`/${role}/dashboard`} replace />
    );
  }

  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("App - Initializing, calling loadUser");
    dispatch(loadUser())
      .then(() => {
        console.log("App - loadUser completed");
      })
      .catch((error) => {
        console.error("App - loadUser failed:", error);
      });
  }, [dispatch]);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/job/:id" element={<JobDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forget-password" element={<ForgotPasswordPage />} />
          <Route path="/company/:id" element={<CompanyDetailPage />} />
          <Route path="/newjob" element={<NewJobPage />} />
          <Route path="/employer/login" element={<EmployerLoginPage />} />
          <Route path="/user/login" element={<UserLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route path="/employer/register" element={<EmployerRegisterPage />} />
          <Route path="/user/register" element={<UserRegisterPage />} />
          <Route path="/job-listings" element={<JobListings />} />
          <Route
            path="/user/forgot-password"
            element={<ForgotPasswordPage />}
          />{" "}
          {/* Route mới được thêm */}
          {/* Employer Routes */}
          <Route
            path="/employer/*"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<EmployerDashboardPage />} />
            <Route path="jobs" element={<EmployerJobsPage />} />
            <Route path="cv" element={<EmployerCVPage />} />
            <Route path="security" element={<EmployerSecurityPage />} />
            <Route
              path="notifications"
              element={<EmployerNotificationsPage />}
            />
            <Route path="history" element={<EmployerHistoryPage />} />
            <Route
              path="job-management"
              element={<EmployerJobManagementPage />}
            />
            <Route path="edit-company/:id" element={<EditCompanyPage />} />
          </Route>
          {/* User Routes */}
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<UserDashboardPage />} />
            <Route path="update" element={<CandidateUpdatePage />} />
            <Route path="applied" element={<AppliedJobsPage />} />
            <Route path="saved" element={<SavedJobsPage />} />
            <Route path="view" element={<ViewProfilePage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="employers" element={<AdminEmployersPage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="slides" element={<AdminSlidesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="security" element={<AdminSecurityPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
