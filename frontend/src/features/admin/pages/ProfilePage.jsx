import React from 'react';
import {
  Building2,
  CalendarDays,
  CircleHelp,
  Fingerprint,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

const unavailableFields = [
  { label: 'Email address', icon: Mail },
  { label: 'Workspace', icon: Building2 },
  { label: 'Member since', icon: CalendarDays },
  { label: 'Account ID', icon: Fingerprint },
];

const ProfilePage = () => (
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
            Profile information unavailable
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            This workspace does not yet provide a signed-in user profile. Personal details are
            intentionally not guessed or taken from sample workspace members.
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
              Your profile fields will appear here when an account profile is connected.
            </p>
          </div>
        </div>

        <div
          role="status"
          className="mt-5 flex gap-3 rounded-xl border border-[#E6E7EC] bg-[#F8F9FC] p-4"
        >
          <CircleHelp
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-slate-500"
          />
          <p className="text-sm leading-6 text-slate-600">
            Editing is unavailable because no profile read or update service is configured.
            Changes cannot be saved from this page.
          </p>
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
          Account information
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Account details are not available from the current application services.
        </p>

        <dl className="mt-5 divide-y divide-[#E6E7EC]">
          {unavailableFields.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between gap-3 py-3 first:pt-0">
              <dt className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                <Icon aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
                <span>{label}</span>
              </dt>
              <dd className="shrink-0 text-sm font-medium text-slate-400">Unavailable</dd>
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
            Security and preferences
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Password management, two-factor authentication, notifications, and theme preferences
            are not connected in this application yet.
          </p>
        </div>
      </div>
    </section>
  </div>
);

export default ProfilePage;
