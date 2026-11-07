import React from 'react';
import {
  Bell,
  Building2,
  CircleHelp,
  MonitorCog,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const unavailableSettings = [
  {
    title: 'Profile and account',
    description: 'Account details and profile editing are not connected.',
    icon: UserRound,
  },
  {
    title: 'Appearance',
    description: 'Theme and display preferences are not available.',
    icon: MonitorCog,
  },
  {
    title: 'Workspace',
    description: 'Workspace details and preferences are not connected.',
    icon: Building2,
  },
  {
    title: 'Security and privacy',
    description: 'Password, session, and privacy controls are not available.',
    icon: ShieldCheck,
  },
];

const SettingsPage = () => (
  <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-sm font-semibold text-[#6542F5]">Workspace preferences</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Manage your workspace preferences and application configuration.
        </p>
      </div>
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E6E7EC] bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
        <Building2 aria-hidden="true" className="size-4 text-slate-400" />
        Workspace details unavailable
      </span>
    </header>

    <section
      aria-labelledby="settings-status-title"
      className="rounded-2xl border border-[#D8D1FF] bg-[#F8F6FF] p-5 sm:p-6"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#6542F5]">
          <CircleHelp aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2 id="settings-status-title" className="text-base font-semibold text-slate-900">
            Settings are not connected yet
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            This workspace does not provide a preferences or configuration service. There are no
            settings to save or reset here, so unavailable controls are not shown as editable.
          </p>
        </div>
      </div>
    </section>

    <section aria-labelledby="settings-sections-title" className="space-y-4">
      <div>
        <h2 id="settings-sections-title" className="text-lg font-semibold text-slate-900">
          Settings and account
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Review what is currently available in this workspace.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F1EEFF] text-[#6542F5]">
              <Bell aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Notification preferences are not available. You can view workspace notification
                records on the Notifications page.
              </p>
              <Link
                to="/admin/notifications"
                className="mt-4 inline-flex h-10 items-center rounded-xl border border-[#E6E7EC] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#D8D1FF] hover:bg-[#F8F6FF] hover:text-[#6542F5] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
              >
                View notifications
              </Link>
            </div>
          </div>
        </article>

        {unavailableSettings.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#DDF4F2] text-[#247A7F]">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    Unavailable
                  </span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  </div>
);

export default SettingsPage;
