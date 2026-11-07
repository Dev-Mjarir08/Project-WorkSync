import React from 'react';
import { CircleHelp, ShieldCheck, Users } from 'lucide-react';
import { mockInvitations } from '../adminInvitationData';

const sampleRoleStyles = [
  'bg-[#F1EEFF] text-[#6542F5]',
  'bg-[#DDF4F2] text-[#247A7F]',
  'bg-[#FFF3E8] text-[#B76825]',
  'bg-[#EAF2FF] text-[#3971C6]',
];

const sampleRoles = [...new Set(mockInvitations.map((invitation) => invitation.role))]
  .filter(Boolean)
  .sort((first, second) => first.localeCompare(second));

const RolesPage = () => (
  <div className="space-y-6">
    <header>
      <p className="mb-2 text-sm font-semibold text-[#6542F5]">Workspace access</p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Roles &amp; Permissions
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Review workspace roles and manage access levels.
      </p>
    </header>

    <section
      role="status"
      className="flex items-start gap-3 rounded-2xl border border-[#D8D1FF] bg-[#F8F6FF] p-4 sm:p-5"
    >
      <CircleHelp aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6542F5]" />
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Role management isn’t connected</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          This page can’t read workspace role assignments or permissions. The labels below come
          from sample invitation records only; they do not define or enforce access.
        </p>
      </div>
    </section>

    <section
      aria-labelledby="sample-roles-title"
      className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="sample-roles-title" className="text-base font-semibold text-slate-900">
            Labels in sample invitations
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            These example labels are not a connected role catalog.
          </p>
        </div>
        {sampleRoles.length > 0 && (
          <span className="text-sm font-medium text-slate-500">
            {sampleRoles.length} sample {sampleRoles.length === 1 ? 'label' : 'labels'}
          </span>
        )}
      </div>

      {sampleRoles.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sampleRoles.map((role, index) => (
            <li
              key={role}
              className="rounded-2xl border border-[#E6E7EC] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid size-11 place-items-center rounded-xl ${
                    sampleRoleStyles[index % sampleRoleStyles.length]
                  }`}
                >
                  {index % 2 === 0 ? (
                    <Users aria-hidden="true" className="size-5" />
                  ) : (
                    <ShieldCheck aria-hidden="true" className="size-5" />
                  )}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Sample label
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{role}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Permission definitions and assigned member counts are unavailable.
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-[#D9DCE5] bg-[#F8F9FC] px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-800">No sample role labels available</p>
          <p className="mt-1 text-sm text-slate-500">
            Labels will appear here if they are present in the sample invitation records.
          </p>
        </div>
      )}
    </section>

    <section
      aria-labelledby="permissions-unavailable-title"
      className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/25 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#DDF4F2] text-[#247A7F]">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h2
            id="permissions-unavailable-title"
            className="text-base font-semibold text-slate-900"
          >
            Permissions
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            No permission model or role-management service is configured. Permissions cannot be
            reviewed, edited, or saved here, and no create, edit, assign, or delete actions are
            available.
          </p>
        </div>
      </div>
    </section>
  </div>
);

export default RolesPage;
