import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import Header from '../components/layout/Header.jsx';

/**
 * Shared Employee Workspace Layout Component
 * Integrates unified Sidebar and Header for Employee routes
 */
const EmployeeLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-teal-600 selection:text-white">
      <Sidebar activeItem="dashboard" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileMenuOpen} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;
