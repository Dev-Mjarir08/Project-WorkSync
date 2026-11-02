import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import RegisterPage from '../features/auth/pages/RegisterPage.jsx';
import DashboardPage from '../features/super-admin/pages/DashboardPage.jsx';
import UsersPage from '../features/super-admin/pages/UsersPage.jsx';
import UserDetailsPage from '../features/super-admin/pages/UserDetailsPage.jsx';
import WorkspacesPage from '../features/super-admin/pages/WorkspacesPage.jsx';
import WorkspaceDetailsPage from '../features/super-admin/pages/WorkspaceDetailsPage.jsx';
import AnalyticsPage from '../features/super-admin/pages/AnalyticsPage.jsx';
import SystemHealthPage from '../features/super-admin/pages/SystemHealthPage.jsx';
import AuditLogsPage from '../features/super-admin/pages/AuditLogsPage.jsx';
import RolesPermissionsPage from '../features/super-admin/pages/RolesPermissionsPage.jsx';
import SettingsPage from '../features/super-admin/pages/SettingsPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Default Landing / Fallback to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Protected Super Admin Dashboard (Role-based access check for 'super_admin') */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:userId" element={<UserDetailsPage />} />
          <Route path="workspaces" element={<WorkspacesPage />} />
          <Route path="workspaces/:workspaceId" element={<WorkspaceDetailsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="system-health" element={<SystemHealthPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="roles" element={<RolesPermissionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
