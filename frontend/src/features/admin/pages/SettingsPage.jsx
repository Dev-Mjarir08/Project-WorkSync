import React, { useEffect, useState } from 'react';
import {
  Bell,
  Building2,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  Sliders,
  Mail,
} from 'lucide-react';
import adminService from '../adminService';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    general: {
      workspaceName: 'WorkSync Workspace',
      defaultRole: 'member',
      timezone: 'UTC',
      allowMemberInvites: true,
    },
    privacy: {
      isPublic: false,
      inviteOnly: true,
    },
    notifications: {
      emailNotifications: true,
      taskAlerts: true,
      weeklyDigest: true,
    },
    permissions: {
      memberCanCreateBoards: true,
      memberCanCreateProjects: true,
      memberCanInvite: false,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSettings();
      if (data) {
        setSettings({
          general: { ...settings.general, ...(data.general || {}) },
          privacy: { ...settings.privacy, ...(data.privacy || {}) },
          notifications: { ...settings.notifications, ...(data.notifications || {}) },
          permissions: { ...settings.permissions, ...(data.permissions || {}) },
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleGeneralChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [field]: value },
    }));
  };

  const handlePrivacyChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [field]: value },
    }));
  };

  const handleNotificationsChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
  };

  const handlePermissionsChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [field]: value },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updateSettings(settings);
      setToast({ type: 'success', text: 'Workspace settings saved successfully!' });
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium border ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-rose-600" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#6542F5]">Workspace configuration</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Workspace Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage branding, access controls, notification defaults, and member permission policies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={isLoading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin text-[#6542F5]' : 'text-slate-500'}`} />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#6542F5] px-5 text-sm font-semibold text-white transition hover:bg-[#5635E0] disabled:opacity-50"
          >
            <Save className="size-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* General & Branding */}
        <section className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="grid size-9 place-items-center rounded-xl bg-purple-50 text-purple-700">
              <Building2 className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">General Workspace Configuration</h2>
              <p className="text-xs text-slate-500">Core properties and default member attributes</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Workspace Display Name
              </label>
              <input
                type="text"
                value={settings.general.workspaceName || ''}
                onChange={(e) => handleGeneralChange('workspaceName', e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Default Member Role
              </label>
              <select
                value={settings.general.defaultRole || 'member'}
                onChange={(e) => handleGeneralChange('defaultRole', e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Primary Timezone
              </label>
              <select
                value={settings.general.timezone || 'UTC'}
                onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option value="UTC">UTC (Universal Time)</option>
                <option value="America/New_York">America/New York (EST/EDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="allowMemberInvites"
                checked={settings.general.allowMemberInvites ?? true}
                onChange={(e) => handleGeneralChange('allowMemberInvites', e.target.checked)}
                className="size-4 rounded text-[#6542F5] focus:ring-[#6542F5] border-slate-300"
              />
              <label htmlFor="allowMemberInvites" className="text-sm font-medium text-slate-700 cursor-pointer">
                Allow members to send workspace invites
              </label>
            </div>
          </div>
        </section>

        {/* Security & Access Policies */}
        <section className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Security &amp; Member Permissions</h2>
              <p className="text-xs text-slate-500">Fine-grained operational limits for non-admin members</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.inviteOnly ?? true}
                onChange={(e) => handlePrivacyChange('inviteOnly', e.target.checked)}
                className="mt-1 size-4 rounded text-[#6542F5] focus:ring-[#6542F5] border-slate-300"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900">Invite-Only Workspace</span>
                <p className="text-xs text-slate-500">Only users with an active invitation link or email can join this workspace.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.permissions.memberCanCreateBoards ?? true}
                onChange={(e) => handlePermissionsChange('memberCanCreateBoards', e.target.checked)}
                className="mt-1 size-4 rounded text-[#6542F5] focus:ring-[#6542F5] border-slate-300"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900">Members can create Kanban Boards</span>
                <p className="text-xs text-slate-500">Allow standard members to instantiate new project boards.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.permissions.memberCanCreateProjects ?? true}
                onChange={(e) => handlePermissionsChange('memberCanCreateProjects', e.target.checked)}
                className="mt-1 size-4 rounded text-[#6542F5] focus:ring-[#6542F5] border-slate-300"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900">Members can create Projects</span>
                <p className="text-xs text-slate-500">Allow members to organize multiple boards into dedicated project groupings.</p>
              </div>
            </label>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Bell className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
              <p className="text-xs text-slate-500">System email broadcasts and activity alerts</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications ?? true}
                onChange={(e) => handleNotificationsChange('emailNotifications', e.target.checked)}
                className="mt-1 size-4 rounded text-[#6542F5] focus:ring-[#6542F5] border-slate-300"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900">Email Notifications</span>
                <p className="text-xs text-slate-500">Deliver notifications via email for task assignments and mentions.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.taskAlerts ?? true}
                onChange={(e) => handleNotificationsChange('taskAlerts', e.target.checked)}
                className="mt-1 size-4 rounded text-[#6542F5] focus:ring-[#6542F5] border-slate-300"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900">Due Date &amp; Overdue Task Alerts</span>
                <p className="text-xs text-slate-500">Notify assignees 24 hours prior to deadline and when overdue.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.weeklyDigest ?? true}
                onChange={(e) => handleNotificationsChange('weeklyDigest', e.target.checked)}
                className="mt-1 size-4 rounded text-[#6542F5] focus:ring-[#6542F5] border-slate-300"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900">Weekly Performance Digest</span>
                <p className="text-xs text-slate-500">Send an automated weekly summary of project velocity and team throughput.</p>
              </div>
            </label>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6542F5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5635E0] disabled:opacity-50"
          >
            <Save className="size-4" />
            {isSaving ? 'Saving Changes...' : 'Save Workspace Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
