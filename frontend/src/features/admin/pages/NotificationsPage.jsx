import React from 'react';
import { Activity, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage = () => (
  <div className="space-y-6">
    <header>
      <p className="mb-2 text-sm font-semibold text-[#6542F5]">Workspace updates</p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Notifications
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Stay updated on workspace activity and important changes.
      </p>
    </header>

    <section
      aria-labelledby="notifications-empty-title"
      className="rounded-2xl border border-[#E6E7EC] bg-white px-5 py-14 text-center shadow-sm shadow-slate-200/30 sm:px-8"
    >
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
        <Bell aria-hidden="true" className="size-5" />
      </span>
      <h2 id="notifications-empty-title" className="mt-4 text-base font-semibold text-slate-900">
        Notifications aren't connected yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        There are no notification records available in this workspace. New notifications will appear
        here when a notification source is connected.
      </p>
      <Link
        to="/admin/activity"
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-[#E6E7EC] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#D8D1FF] hover:bg-[#F8F6FF] hover:text-[#6542F5] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
      >
        <Activity aria-hidden="true" className="size-4" />
        View workspace activity
      </Link>
    </section>
  </div>
);

export default NotificationsPage;
