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
import TaskDetailsPage from "../features/manager/pages/TaskDetailsPage.jsx";

// Auth pages
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage.jsx";

// Employee pages
import EmployeeDashboardPage from "../features/employee/pages/DashboardPage.jsx";
import EmployeeMyTasksPage from "../features/employee/pages/MyTasksPage.jsx";
import EmployeeTaskDetailsPage from "../features/employee/pages/TaskDetailsPage.jsx";
import EmployeeProjectsPage from "../features/employee/pages/ProjectsPage.jsx";
import EmployeeProjectDetailsPage from "../features/employee/pages/ProjectDetailsPage.jsx";
import EmployeeBoardsPage from "../features/employee/pages/BoardsPage.jsx";
import EmployeeCalendarPage from "../features/employee/pages/CalendarPage.jsx";
import EmployeeDiscussionsPage from "../features/employee/pages/DiscussionsPage.jsx";
import EmployeeActivityPage from "../features/employee/pages/ActivityPage.jsx";
import EmployeeNotificationsPage from "../features/employee/pages/NotificationsPage.jsx";
import EmployeeProfilePage from "../features/employee/pages/ProfilePage.jsx";
import EmployeeSearchPage from "../features/employee/pages/SearchPage.jsx";

// Admin pages
import AdminDashboardPage from "../features/admin/pages/DashboardPage.jsx";
import AdminMembersPage from "../features/admin/pages/MembersPage.jsx";
import AdminMemberDetailsPage from "../features/admin/pages/MemberDetailsPage.jsx";
import AdminInvitationsPage from "../features/admin/pages/InvitationsPage.jsx";
import AdminRolesPage from "../features/admin/pages/RolesPage.jsx";
import AdminWorkspacePage from "../features/admin/pages/WorkspacePage.jsx";
import AdminBoardsPage from "../features/admin/pages/BoardsPage.jsx";
import AdminBoardDetailsPage from "../features/admin/pages/BoardDetailsPage.jsx";
import AdminCreateBoardPage from "../features/admin/pages/CreateBoardPage.jsx";
import AdminTasksPage from "../features/admin/pages/TasksPage.jsx";
import AdminActivityPage from "../features/admin/pages/ActivityPage.jsx";
import AdminNotificationsPage from "../features/admin/pages/NotificationsPage.jsx";
import AdminProfilePage from "../features/admin/pages/ProfilePage.jsx";
import AdminSettingsPage from "../features/admin/pages/SettingsPage.jsx";

// Super Admin pages
import SuperAdminDashboardPage from "../features/super-admin/pages/DashboardPage.jsx";
import SuperAdminWorkspacesPage from "../features/super-admin/pages/WorkspacesPage.jsx";
import SuperAdminWorkspaceDetailsPage from "../features/super-admin/pages/WorkspaceDetailsPage.jsx";
import SuperAdminUsersPage from "../features/super-admin/pages/UsersPage.jsx";
import SuperAdminUserDetailsPage from "../features/super-admin/pages/UserDetailsPage.jsx";
import SuperAdminRolesPermissionsPage from "../features/super-admin/pages/RolesPermissionsPage.jsx";
import SuperAdminBoardsPage from "../features/super-admin/pages/BoardsPage.jsx";
import SuperAdminBoardDetailsPage from "../features/super-admin/pages/BoardDetailsPage.jsx";
import SuperAdminSystemHealthPage from "../features/super-admin/pages/SystemHealthPage.jsx";
import SuperAdminAuditLogsPage from "../features/super-admin/pages/AuditLogsPage.jsx";
import SuperAdminAnnouncementsPage from "../features/super-admin/pages/AnnouncementsPage.jsx";
import SuperAdminProfilePage from "../features/super-admin/pages/ProfilePage.jsx";
import SuperAdminSettingsPage from "../features/super-admin/pages/SettingsPage.jsx";

/**
 * AppRoutes — Centralized Route Configuration for WorkSync
 * Acts as the single source of truth for routing across all roles and public paths.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Root entry redirect */}
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
      <Route path="/manager/tasks/:taskId" element={<TaskDetailsPage />} />
      <Route path="/manager/activity" element={<ActivityPage />} />
      <Route path="/manager/assignments" element={<AssignmentsPage />} />
      <Route path="/manager/team" element={<TeamPage />} />
      <Route path="/manager/workload" element={<TeamWorkloadPage />} />
      <Route path="/manager/reports" element={<ReportsPage />} />
      <Route path="/manager/notifications" element={<NotificationsPage />} />
      <Route path="/manager/profile" element={<ProfilePage />} />

      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
      <Route path="/employee/tasks" element={<EmployeeMyTasksPage />} />
      <Route path="/employee/tasks/:taskId" element={<EmployeeTaskDetailsPage />} />
      <Route path="/employee/projects" element={<EmployeeProjectsPage />} />
      <Route path="/employee/projects/:projectId" element={<EmployeeProjectDetailsPage />} />
      <Route path="/employee/boards" element={<EmployeeBoardsPage />} />
      <Route path="/employee/calendar" element={<EmployeeCalendarPage />} />
      <Route path="/employee/discussions" element={<EmployeeDiscussionsPage />} />
      <Route path="/employee/activity" element={<EmployeeActivityPage />} />
      <Route path="/employee/notifications" element={<EmployeeNotificationsPage />} />
      <Route path="/employee/profile" element={<EmployeeProfilePage />} />
      <Route path="/employee/search" element={<EmployeeSearchPage />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/members" element={<AdminMembersPage />} />
      <Route path="/admin/members/:memberId" element={<AdminMemberDetailsPage />} />
      <Route path="/admin/invitations" element={<AdminInvitationsPage />} />
      <Route path="/admin/roles" element={<AdminRolesPage />} />
      <Route path="/admin/workspace" element={<AdminWorkspacePage />} />
      <Route path="/admin/boards" element={<AdminBoardsPage />} />
      <Route path="/admin/boards/:boardId" element={<AdminBoardDetailsPage />} />
      <Route path="/admin/boards/create" element={<AdminCreateBoardPage />} />
      <Route path="/admin/tasks" element={<AdminTasksPage />} />
      <Route path="/admin/activity" element={<AdminActivityPage />} />
      <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
      <Route path="/admin/profile" element={<AdminProfilePage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />

      {/* Super Admin Routes */}
      <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
      <Route path="/super-admin/workspaces" element={<SuperAdminWorkspacesPage />} />
      <Route path="/super-admin/workspaces/:workspaceId" element={<SuperAdminWorkspaceDetailsPage />} />
      <Route path="/super-admin/users" element={<SuperAdminUsersPage />} />
      <Route path="/super-admin/users/:userId" element={<SuperAdminUserDetailsPage />} />
      <Route path="/super-admin/roles" element={<SuperAdminRolesPermissionsPage />} />
      <Route path="/super-admin/boards" element={<SuperAdminBoardsPage />} />
      <Route path="/super-admin/boards/:boardId" element={<SuperAdminBoardDetailsPage />} />
      <Route path="/super-admin/system-health" element={<SuperAdminSystemHealthPage />} />
      <Route path="/super-admin/audit-logs" element={<SuperAdminAuditLogsPage />} />
      <Route path="/super-admin/announcements" element={<SuperAdminAnnouncementsPage />} />
      <Route path="/super-admin/profile" element={<SuperAdminProfilePage />} />
      <Route path="/super-admin/settings" element={<SuperAdminSettingsPage />} />

      {/* Wildcard fallback to manager dashboard */}
      <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
