
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Manager pages
import DashboardPage from "../features/manager/pages/DashboardPage.jsx";
import ProjectsPage from "../features/manager/pages/ProjectsPage.jsx";
import ProjectDetailsPage from "../features/manager/pages/ProjectDetailsPage.jsx";
import BoardsPage from "../features/manager/pages/BoardsPage.jsx";
import TasksPage from "../features/manager/pages/TasksPage.jsx";
import ActivityPage from "../features/manager/pages/ActivityPage.jsx";
import AssignmentsPage from "../features/manager/pages/AssignmentsPage.jsx";
import TeamPage from "../features/manager/pages/TeamPage.jsx";
import TeamWorkloadPage from "../features/manager/pages/TeamWorkloadPage.jsx";
import ReportsPage from "../features/manager/pages/ReportsPage.jsx";
import NotificationsPage from "../features/manager/pages/NotificationsPage.jsx";
import ProfilePage from "../features/manager/pages/ProfilePage.jsx";
import CreateTaskPage from "../features/manager/pages/CreateTaskPage.jsx";
import TaskDetailsPage from "../features/manager/pages/TaskDetailsPage.jsx";

// Auth pages
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Manager Routes */}
      <Route path="/manager/dashboard" element={<DashboardPage />} />

      <Route path="/manager/projects" element={<ProjectsPage />} />
      <Route path="/manager/projects/:projectId" element={<ProjectDetailsPage />} />

      <Route path="/manager/boards/:boardId" element={<BoardsPage />} />

      <Route path="/manager/tasks" element={<TasksPage />} />
      <Route path="/manager/tasks/create" element={<CreateTaskPage />} />
      <Route path="/manager/tasks/:taskId" element={<TaskDetailsPage />} />

      <Route path="/manager/activity" element={<ActivityPage />} />
      <Route path="/manager/assignments" element={<AssignmentsPage />} />

      <Route path="/manager/team" element={<TeamPage />} />
      <Route path="/manager/workload" element={<TeamWorkloadPage />} />

      <Route path="/manager/reports" element={<ReportsPage />} />
      <Route path="/manager/notifications" element={<NotificationsPage />} />
      <Route path="/manager/profile" element={<ProfilePage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;