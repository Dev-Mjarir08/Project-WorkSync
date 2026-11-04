import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ActivityPage from '../features/admin/pages/ActivityPage';
import BoardDetailsPage from '../features/admin/pages/BoardDetailsPage';
import BoardsPage from '../features/admin/pages/BoardsPage';
import CreateBoardPage from '../features/admin/pages/CreateBoardPage';
import DashboardPage from '../features/admin/pages/DashboardPage';
import InvitationsPage from '../features/admin/pages/InvitationsPage';
import NotificationsPage from '../features/admin/pages/NotificationsPage';
import SettingsPage from '../features/admin/pages/SettingsPage';
import TasksPage from '../features/admin/pages/TasksPage';
import WorkspacePage from '../features/admin/pages/WorkspacePage';
import AdminLayout from '../layouts/AdminLayout';

const Router = () => (
  <Routes>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="/admin/boards" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="activity" element={<ActivityPage />} />
      <Route path="invitations" element={<InvitationsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="tasks" element={<TasksPage />} />
      <Route path="workspace" element={<WorkspacePage />} />
      <Route path="boards" element={<BoardsPage />} />
      <Route path="boards/new" element={<CreateBoardPage />} />
      <Route path="boards/:boardId" element={<BoardDetailsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/admin/boards" replace />} />
  </Routes>
);

export default Router;
