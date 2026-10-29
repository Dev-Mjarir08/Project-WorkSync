import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx';
import DashboardPage from '../features/super-admin/pages/DashboardPage.jsx';
import UsersPage from '../features/super-admin/pages/UsersPage.jsx';
import WorkspacesPage from '../features/super-admin/pages/WorkspacesPage.jsx';
import SystemHealthPage from '../features/super-admin/pages/SystemHealthPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/super-admin/dashboard" replace />} />

      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="system-health" element={<SystemHealthPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/super-admin/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
