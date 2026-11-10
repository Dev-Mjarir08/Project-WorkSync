import React, { useState } from 'react';
import {
  Building2,
  CalendarDays,
  Fingerprint,
  Mail,
  ShieldCheck,
  UserRound,
  Lock,
  Key,
} from 'lucide-react';
import { getCurrentUser } from '../../../utils/userStorage.js';
import { authService } from '../../auth/authService.js';

const ProfilePage = () => {
  const currentUser = getCurrentUser();
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Administrator';
  const userEmail = currentUser?.email || 'admin@worksync.io';
  const userRole = currentUser?.role || 'admin';

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setUpdatingPassword(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        email: userEmail,
      });
      setPasswordSuccess('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#DDF4F2] text-[#247A7F]">
              <Lock aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2
                id="security-preferences-title"
                className="text-base font-semibold text-slate-900"
              >
                Password & Security
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Change your account password and security credentials.
              </p>
            </div>
          </div>

          {!showPasswordForm && (
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 rounded-xl bg-[#6542F5] text-white text-xs font-semibold hover:bg-[#5232d9] transition self-start sm:self-auto cursor-pointer"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            {passwordError && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                {passwordSuccess}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#6542F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#6542F5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#6542F5]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError('');
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingPassword}
                className="px-4 py-1.5 rounded-xl bg-[#6542F5] text-white text-xs font-semibold hover:bg-[#5232d9] transition disabled:opacity-50 cursor-pointer"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
