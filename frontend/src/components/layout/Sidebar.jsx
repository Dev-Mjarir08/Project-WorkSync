import React from 'react';
import { Activity, LayoutDashboard, PanelsTopLeft, Send } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Boards', to: '/admin/boards', icon: PanelsTopLeft },
  { label: 'Invitations', to: '/admin/invitations', icon: Send },
  { label: 'Activity', to: '/admin/activity', icon: Activity },
];

const Sidebar = () => (
  <aside className="w-full shrink-0 bg-[#1F1B2A] text-white md:min-h-screen md:w-64">
    <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
      <span className="grid size-9 place-items-center rounded-xl bg-[#6542F5] text-sm font-bold">
        W
      </span>
      <div>
        <p className="text-sm font-semibold tracking-wide">WorkSync</p>
        <p className="text-xs text-white/55">Admin workspace</p>
      </div>
    </div>
    <nav aria-label="Admin navigation" className="flex gap-2 overflow-x-auto p-3 md:block md:space-y-1">
      {links.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-white/65 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Icon aria-hidden="true" className="size-[18px]" />
          {label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
