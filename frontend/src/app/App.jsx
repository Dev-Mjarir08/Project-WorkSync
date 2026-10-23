import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../features/manager/pages/DashboardPage.jsx";
import ProjectsPage from "../features/manager/pages/ProjectsPage.jsx";
import ProjectDetailsPage from "../features/manager/pages/ProjectDetailsPage.jsx";
import BoardsPage from "../features/manager/pages/BoardsPage.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />
        <Route path="/manager/dashboard" element={<DashboardPage />} />
        <Route path="/manager/projects" element={<ProjectsPage />} />
        <Route path="/manager/projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path="/manager/boards/:boardId" element={<BoardsPage />} />
        {/* Fallback to manager dashboard */}
        <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
