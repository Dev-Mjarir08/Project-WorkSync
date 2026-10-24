import React from 'react';
import { Bell } from 'lucide-react';

const Header = () => (
  <header className="flex h-16 items-center justify-between border-b border-[#E6E7EC] bg-white px-4 sm:px-6 lg:px-8">
    <div>
      <p className="text-sm font-semibold text-slate-900">WorkSync Admin</p>
      <p className="hidden text-xs text-slate-500 sm:block">Manage boards and team activity</p>
    </div>
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-[#F1EEFF] text-[#6542F5]">
        <Bell className="size-4" />
      </span>
      <span className="grid size-9 place-items-center rounded-full bg-[#DDF4F2] text-xs font-semibold text-[#247A7F]">
        AD
      </span>
      <span className="hidden text-sm font-medium text-slate-700 sm:inline">Admin</span>
    </div>
  </header>
);

export default Header;
