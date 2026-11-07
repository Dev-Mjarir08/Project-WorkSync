import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute, RootRedirect } from '../components/common/ProtectedRoute.jsx';
import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import ManagerLayout from '../layouts/ManagerLayout.jsx';
import EmployeeLayout from '../layouts/EmployeeLayout.jsx';

// Auth Pages
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage.jsx'));

// Workspace Admin Pages
const AdminDashboardPage = lazy(() => import('../features/admin/pages/DashboardPage.jsx'));
const AdminActivityPage = lazy(() => import('../features/admin/pages/ActivityPage.jsx'));
const AdminInvitationsPage = lazy(() => import('../features/admin/pages/InvitationsPage.jsx'));
const AdminNotificationsPage = lazy(() => import('../features/admin/pages/NotificationsPage.jsx'));
const AdminSettingsPage = lazy(() => import('../features/admin/pages/SettingsPage.jsx'));
const AdminTasksPage = lazy(() => import('../features/admin/pages/TasksPage.jsx'));
const AdminWorkspacePage = lazy(() => import('../features/admin/pages/WorkspacePage.jsx'));
const AdminBoardsPage = lazy(() => import('../features/admin/pages/BoardsPage.jsx'));
const AdminCreateBoardPage = lazy(() => import('../features/admin/pages/CreateBoardPage.jsx'));
const AdminBoardDetailsPage = lazy(() => import('../features/admin/pages/BoardDetailsPage.jsx'));
const AdminMembersPage = lazy(() => import('../features/admin/pages/MembersPage.jsx'));
const AdminMemberDetailsPage = lazy(() => import('../features/admin/pages/MemberDetailsPage.jsx'));
const AdminRolesPage = lazy(() => import('../features/admin/pages/RolesPage.jsx'));
const AdminProfilePage = lazy(() => import('../features/admin/pages/ProfilePage.jsx'));

// Manager Pages
const ManagerDashboardPage = lazy(() => import('../features/manager/pages/DashboardPage.jsx'));
const ManagerProjectsPage = lazy(() => import('../features/manager/pages/ProjectsPage.jsx'));
const ManagerProjectDetailsPage = lazy(() => import('../features/manager/pages/ProjectDetailsPage.jsx'));
const ManagerBoardsPage = lazy(() => import('../features/manager/pages/BoardsPage.jsx'));
const ManagerTasksPage = lazy(() => import('../features/manager/pages/TasksPage.jsx'));
const ManagerCreateTaskPage = lazy(() => import('../features/manager/pages/CreateTaskPage.jsx'));
const ManagerTaskDetailsPage = lazy(() => import('../features/manager/pages/TaskDetailsPage.jsx'));
const ManagerActivityPage = lazy(() => import('../features/manager/pages/ActivityPage.jsx'));
const ManagerAssignmentsPage = lazy(() => import('../features/manager/pages/AssignmentsPage.jsx'));
const ManagerTeamPage = lazy(() => import('../features/manager/pages/TeamPage.jsx'));
const ManagerTeamWorkloadPage = lazy(() => import('../features/manager/pages/TeamWorkloadPage.jsx'));
const ManagerReportsPage = lazy(() => import('../features/manager/pages/ReportsPage.jsx'));
const ManagerNotificationsPage = lazy(() => import('../features/manager/pages/NotificationsPage.jsx'));
const ManagerProfilePage = lazy(() => import('../features/manager/pages/ProfilePage.jsx'));
const ManagerCalendarPage = lazy(() => import('../features/manager/pages/CalendarPage.jsx'));

// Employee Pages
const EmployeeDashboardPage = lazy(() => import('../features/employee/pages/DashboardPage.jsx'));
const EmployeeMyTasksPage = lazy(() => import('../features/employee/pages/MyTasksPage.jsx'));
const EmployeeTaskDetailsPage = lazy(() => import('../features/employee/pages/TaskDetailsPage.jsx'));
const EmployeeProjectsPage = lazy(() => import('../features/employee/pages/ProjectsPage.jsx'));
const EmployeeProjectDetailsPage = lazy(() => import('../features/employee/pages/ProjectDetailsPage.jsx'));
const EmployeeBoardsPage = lazy(() => import('../features/employee/pages/BoardsPage.jsx'));
const EmployeeCalendarPage = lazy(() => import('../features/employee/pages/CalendarPage.jsx'));
const EmployeeDiscussionsPage = lazy(() => import('../features/employee/pages/DiscussionsPage.jsx'));
const EmployeeNotificationsPage = lazy(() => import('../features/employee/pages/NotificationsPage.jsx'));
const EmployeeActivityPage = lazy(() => import('../features/employee/pages/ActivityPage.jsx'));
const EmployeeProfilePage = lazy(() => import('../features/employee/pages/ProfilePage.jsx'));
const EmployeeSearchPage = lazy(() => import('../features/employee/pages/SearchPage.jsx'));

// Super Admin Pages
const SuperDashboardPage = lazy(() => import('../features/super-admin/pages/DashboardPage.jsx'));
const SuperUsersPage = lazy(() => import('../features/super-admin/pages/UsersPage.jsx'));
const SuperUserDetailsPage = lazy(() => import('../features/super-admin/pages/UserDetailsPage.jsx'));
const SuperWorkspacesPage = lazy(() => import('../features/super-admin/pages/WorkspacesPage.jsx'));
const SuperWorkspaceDetailsPage = lazy(() => import('../features/super-admin/pages/WorkspaceDetailsPage.jsx'));
const SuperBoardsPage = lazy(() => import('../features/super-admin/pages/BoardsPage.jsx'));
const SuperBoardDetailsPage = lazy(() => import('../features/super-admin/pages/BoardDetailsPage.jsx'));
const SuperTasksPage = lazy(() => import('../features/super-admin/pages/TasksPage.jsx'));
const SuperAnalyticsPage = lazy(() => import('../features/super-admin/pages/AnalyticsPage.jsx'));
const SuperAnnouncementsPage = lazy(() => import('../features/super-admin/pages/AnnouncementsPage.jsx'));
const SuperSystemHealthPage = lazy(() => import('../features/super-admin/pages/SystemHealthPage.jsx'));
const SuperAuditLogsPage = lazy(() => import('../features/super-admin/pages/AuditLogsPage.jsx'));
const SuperRolesPermissionsPage = lazy(() => import('../features/super-admin/pages/RolesPermissionsPage.jsx'));
const SuperSettingsPage = lazy(() => import('../features/super-admin/pages/SettingsPage.jsx'));
const SuperProfilePage = lazy(() => import('../features/super-admin/pages/ProfilePage.jsx'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
    <div className="relative">
      <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
      </div>
    </div>
    <span className="text-xs font-medium text-slate-400 tracking-wide">Loading module...</span>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Routes - Only accessible when NOT logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Root Path - Auto-directs based on Auth & Role */}
        <Route path="/" element={<RootRedirect />} />

        {/* Manager Portal - Restricted to Managers, Admins, and Super Admins */}
        <Route element={<ProtectedRoute allowedRoles={['manager', 'admin', 'super_admin']} />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<Navigate to="/manager/dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboardPage />} />
            <Route path="projects" element={<ManagerProjectsPage />} />
            <Route path="projects/:projectId" element={<ManagerProjectDetailsPage />} />
            <Route path="boards/:boardId" element={<ManagerBoardsPage />} />
            <Route path="tasks" element={<ManagerTasksPage />} />
            <Route path="tasks/create" element={<ManagerCreateTaskPage />} />
            <Route path="tasks/:taskId" element={<ManagerTaskDetailsPage />} />
            <Route path="activity" element={<ManagerActivityPage />} />
            <Route path="assignments" element={<ManagerAssignmentsPage />} />
            <Route path="team" element={<ManagerTeamPage />} />
            <Route path="workload" element={<ManagerTeamWorkloadPage />} />
            <Route path="reports" element={<ManagerReportsPage />} />
            <Route path="notifications" element={<ManagerNotificationsPage />} />
            <Route path="profile" element={<ManagerProfilePage />} />
            <Route path="calendar" element={<ManagerCalendarPage />} />
          </Route>
        </Route>

        {/* Workspace Admin Portal - Restricted to Admins & Super Admins */}
        <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="workspace" element={<AdminWorkspacePage />} />
            <Route path="members" element={<AdminMembersPage />} />
            <Route path="members/:memberId" element={<AdminMemberDetailsPage />} />
            <Route path="boards" element={<AdminBoardsPage />} />
            <Route path="boards/new" element={<AdminCreateBoardPage />} />
            <Route path="boards/:boardId" element={<AdminBoardDetailsPage />} />
            <Route path="tasks" element={<AdminTasksPage />} />
            <Route path="invitations" element={<AdminInvitationsPage />} />
            <Route path="activity" element={<AdminActivityPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
        </Route>

        {/* Employee Portal - Restricted to Employees/Members and above */}
        <Route element={<ProtectedRoute allowedRoles={['employee', 'member', 'manager', 'admin', 'super_admin']} />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboardPage />} />
            <Route path="tasks" element={<EmployeeMyTasksPage />} />
            <Route path="tasks/:taskId" element={<EmployeeTaskDetailsPage />} />
            <Route path="projects" element={<EmployeeProjectsPage />} />
            <Route path="projects/:projectId" element={<EmployeeProjectDetailsPage />} />
            <Route path="boards" element={<EmployeeBoardsPage />} />
            <Route path="calendar" element={<EmployeeCalendarPage />} />
            <Route path="discussions" element={<EmployeeDiscussionsPage />} />
            <Route path="notifications" element={<EmployeeNotificationsPage />} />
            <Route path="activity" element={<EmployeeActivityPage />} />
            <Route path="profile" element={<EmployeeProfilePage />} />
            <Route path="search" element={<EmployeeSearchPage />} />
          </Route>
        </Route>

        {/* Super Admin Portal - Restricted to Super Admins ONLY */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperDashboardPage />} />
            <Route path="users" element={<SuperUsersPage />} />
            <Route path="users/:userId" element={<SuperUserDetailsPage />} />
            <Route path="workspaces" element={<SuperWorkspacesPage />} />
            <Route path="workspaces/:workspaceId" element={<SuperWorkspaceDetailsPage />} />
            <Route path="boards" element={<SuperBoardsPage />} />
            <Route path="boards/:boardId" element={<SuperBoardDetailsPage />} />
            <Route path="tasks" element={<SuperTasksPage />} />
            <Route path="announcements" element={<SuperAnnouncementsPage />} />
            <Route path="analytics" element={<SuperAnalyticsPage />} />
            <Route path="system-health" element={<SuperSystemHealthPage />} />
            <Route path="audit-logs" element={<SuperAuditLogsPage />} />
            <Route path="roles" element={<SuperRolesPermissionsPage />} />
            <Route path="settings" element={<SuperSettingsPage />} />
            <Route path="profile" element={<SuperProfilePage />} />
          </Route>
        </Route>

        {/* Catch-all redirect to RootRedirect */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
