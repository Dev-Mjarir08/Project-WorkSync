import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar.jsx";
import Header from "../components/layout/Header.jsx";

/**
 * Shared Manager Layout Component
 * Integrates unified Sidebar and consistent Header for Manager routes
 */
const ManagerLayout = ({ children, activeItem = "dashboard" }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Unified Light Theme Sidebar */}
      <Sidebar activeItem={activeItem} mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Viewport */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileMenuOpen} />
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default ManagerLayout;
