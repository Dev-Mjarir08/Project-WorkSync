import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx';

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage.jsx'));

const DashboardPage = lazy(() => import('../features/super-admin/pages/DashboardPage.jsx'));
const UsersPage = lazy(() => import('../features/super-admin/pages/UsersPage.jsx'));
const UserDetailsPage = lazy(() => import('../features/super-admin/pages/UserDetailsPage.jsx'));
const WorkspacesPage = lazy(() => import('../features/super-admin/pages/WorkspacesPage.jsx'));
const WorkspaceDetailsPage = lazy(() => import('../features/super-admin/pages/WorkspaceDetailsPage.jsx'));
const BoardsPage = lazy(() => import('../features/super-admin/pages/BoardsPage.jsx'));
const BoardDetailsPage = lazy(() => import('../features/super-admin/pages/BoardDetailsPage.jsx'));
const TasksPage = lazy(() => import('../features/super-admin/pages/TasksPage.jsx'));
const AnalyticsPage = lazy(() => import('../features/super-admin/pages/AnalyticsPage.jsx'));
const AnnouncementsPage = lazy(() => import('../features/super-admin/pages/AnnouncementsPage.jsx'));
const SystemHealthPage = lazy(() => import('../features/super-admin/pages/SystemHealthPage.jsx'));
const AuditLogsPage = lazy(() => import('../features/super-admin/pages/AuditLogsPage.jsx'));
const RolesPermissionsPage = lazy(() => import('../features/super-admin/pages/RolesPermissionsPage.jsx'));
const SettingsPage = lazy(() => import('../features/super-admin/pages/SettingsPage.jsx'));
const ProfilePage = lazy(() => import('../features/super-admin/pages/ProfilePage.jsx'));

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:userId" element={<UserDetailsPage />} />
            <Route path="workspaces" element={<WorkspacesPage />} />
            <Route path="workspaces/:workspaceId" element={<WorkspaceDetailsPage />} />
            <Route path="boards" element={<BoardsPage />} />
            <Route path="boards/:boardId" element={<BoardDetailsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="system-health" element={<SystemHealthPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="roles" element={<RolesPermissionsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;