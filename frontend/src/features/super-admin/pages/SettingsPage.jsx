import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Save,
  HardDrive,
  Mail,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  RefreshCw
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await superAdminService.getPlatformSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load platform settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await superAdminService.updatePlatformSettings(settings);
      showToast('Platform security and governance settings updated successfully!');
    } catch {
      showToast('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading platform configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-200 shadow-2xl flex items-center gap-3 animate-slideDown">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sliders className="h-7 w-7 text-indigo-400" />
            <span>Platform Settings & Policies</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global tenant defaults, security enforcement rules, and administrative thresholds.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: General Platform Configuration */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">General Platform Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Platform Instance Name</label>
              <input
                type="text"
                value={settings?.general?.platformName || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, platformName: e.target.value }
                })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">System Support Email</label>
              <input
                type="email"
                value={settings?.general?.supportEmail || ''}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, supportEmail: e.target.value }
                })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Default Self-Registration Role</label>
              <select
                value={settings?.general?.defaultUserRole || 'member'}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, defaultUserRole: e.target.value }
                })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                value={settings?.general?.sessionTimeoutMinutes || 60}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, sessionTimeoutMinutes: parseInt(e.target.value) || 60 }
                })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Security & Authentication Policies */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Security & Authentication Policies</h2>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <span className="font-semibold text-white text-sm">Enforce Two-Factor Authentication (2FA)</span>
                <p className="text-slate-400 mt-0.5">Mandate authenticator app verification for all administrators</p>
              </div>
              <input
                type="checkbox"
                checked={!!settings?.security?.enforceMfa}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, enforceMfa: e.target.checked }
                })}
                className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <span className="font-semibold text-white text-sm">Strict Password Complexity Rules</span>
                <p className="text-slate-400 mt-0.5">Require minimum 8 characters with upper, numeric, and symbol chars</p>
              </div>
              <input
                type="checkbox"
                checked={!!settings?.security?.requireStrongPasswords}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, requireStrongPasswords: e.target.checked }
                })}
                className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <div>
                <span className="font-semibold text-white text-sm">Allow Self-Serve New User Registration</span>
                <p className="text-slate-400 mt-0.5">Permit public registration without mandatory invite link</p>
              </div>
              <input
                type="checkbox"
                checked={!!settings?.general?.allowNewRegistrations}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, allowNewRegistrations: e.target.checked }
                })}
                className="h-5 w-5 accent-indigo-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Storage & Quota Allocations */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <HardDrive className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Storage Quotas & Retention</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <label className="font-semibold text-slate-300">Max File Upload (MB)</label>
              <input
                type="number"
                value={settings?.storage?.maxAttachmentSizeMb || 50}
                onChange={(e) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, maxAttachmentSizeMb: parseInt(e.target.value) || 50 }
                })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <label className="font-semibold text-slate-300">Default Workspace Quota (GB)</label>
              <input
                type="number"
                value={settings?.storage?.workspaceQuotaGb || 20}
                onChange={(e) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, workspaceQuotaGb: parseInt(e.target.value) || 20 }
                })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <label className="font-semibold text-slate-300">Audit Trail Retention (Days)</label>
              <input
                type="number"
                value={settings?.storage?.retentionDays || 365}
                onChange={(e) => setSettings({
                  ...settings,
                  storage: { ...settings.storage, retentionDays: parseInt(e.target.value) || 365 }
                })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
