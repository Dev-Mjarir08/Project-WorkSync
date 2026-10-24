import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const AdminLayout = () => (
  <div className="scheme-light flex min-h-screen w-full min-w-0 flex-col bg-[#F8F9FC] text-slate-900 md:flex-row">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <Header />
      <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full min-w-0 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);

export default AdminLayout;
