import React from 'react';
import {
  Building2,
  CalendarDays,
  Fingerprint,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { getCurrentUser } from '../../../utils/userStorage.js';

const ProfilePage = () => {
  const currentUser = getCurrentUser();
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Administrator';
  const userEmail = currentUser?.email || 'admin@worksync.io';
  const userRole = currentUser?.role || 'admin';

  const accountFields = [
    { label: 'Email address', value: userEmail, icon: Mail },
    { label: 'Role', value: userRole.toUpperCase(), icon: Building2 },
    { label: 'Member since', value: '2026', icon: CalendarDays },
    { label: 'Account ID', value: currentUser?.id || 'ADM-8921', icon: Fingerprint },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="mb-2 text-sm font-semibold text-[#6542F5]">Account</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Manage your personal information and account details.
        </p>
      </header>

      <section
        aria-labelledby="profile-overview-title"
        className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
            <UserRound aria-hidden="true" className="size-8" />
          </span>
          <div className="min-w-0">
            <h2
              id="profile-overview-title"
              className="text-lg font-semibold text-slate-900"
            >
              {userName}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              {userEmail} • {userRole.toUpperCase()}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-5">
        <section
          aria-labelledby="personal-information-title"
          className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6 xl:col-span-3"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F1EEFF] text-[#6542F5]">
              <UserRound aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2
                id="personal-information-title"
                className="text-base font-semibold text-slate-900"
              >
                Personal information
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Connected administrator profile details.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
              <p className="mt-1 text-sm font-medium text-slate-800">{userName}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
              <p className="mt-1 text-sm font-medium text-slate-800">{userEmail}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Role</label>
              <p className="mt-1 text-sm font-medium text-slate-800 capitalize">{userRole}</p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="account-information-title"
          className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6 xl:col-span-2"
        >
          <h2
            id="account-information-title"
            className="text-base font-semibold text-slate-900"
          >
            Account details
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Workspace and credential summary.
          </p>

          <dl className="mt-5 divide-y divide-[#E6E7EC]">
            {accountFields.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <dt className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                  <Icon aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
                  <span>{label}</span>
                </dt>
                <dd className="shrink-0 text-sm font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section
        aria-labelledby="security-preferences-title"
        className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#DDF4F2] text-[#247A7F]">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2
              id="security-preferences-title"
              className="text-base font-semibold text-slate-900"
            >
              Security and access
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Role-based isolation is active. This session data is strictly scoped to your administrator account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
