import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Mail,
  Camera,
  Trash2,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import superAdminService from '../superAdminService.js';

export const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toast, setToast] = useState(null);

  // Forms
  const [profileForm, setProfileForm] = useState({ name: '', email: '', bio: '', avatar: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [profData, sessData] = await Promise.all([
        superAdminService.getProfile(),
        superAdminService.getProfileSessions()
      ]);

      setProfile(profData);
      setSessions(sessData?.sessions || sessData || []);

      if (profData) {
        setProfileForm({
          name: profData.name || '',
          email: profData.email || '',
          bio: profData.bio || '',
          avatar: profData.avatar || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await superAdminService.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        bio: profileForm.bio
      });

      if (profileForm.avatar && profileForm.avatar !== profile?.avatar) {
        await superAdminService.updateAvatar(profileForm.avatar);
      }

      showToast('Profile information updated successfully!');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match!', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setSavingPassword(true);
      await superAdminService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      showToast('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message || 'Current password incorrect', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await superAdminService.revokeProfileSession(sessionId);
      showToast('Device session revoked successfully');
      const sessData = await superAdminService.getProfileSessions();
      setSessions(sessData?.sessions || sessData || []);
    } catch (err) {
      showToast('Failed to revoke session', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400">Loading administrator profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-rose-400" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-3 border-b border-slate-800/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <User className="h-7 w-7 text-indigo-400" />
          <span>Super Admin Account & Security</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your platform root credentials, profile identity, authentication password, and active sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-3xl p-6 text-center space-y-4">
            <div className="relative mx-auto w-24 h-24">
              <img
                src={
                  profileForm.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                }
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow-xl"
              />
              <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white shadow-md">
                <Camera className="h-3.5 w-3.5" />
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{profile?.name || 'Super Admin'}</h3>
              <p className="text-xs text-indigo-400 font-semibold tracking-wider uppercase mt-0.5">Root Administrator</p>
              <p className="text-xs text-slate-400 mt-1">{profile?.email || 'admin@worksync.io'}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-left space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Account Role:</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold uppercase text-[10px]">
                  super_admin
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Clearance:</span>
                <span className="text-emerald-400 font-medium">Unrestricted Root</span>
              </div>
            </div>
          </div>

          {/* Quick Security Badge */}
          <div className="bg-gradient-to-br from-indigo-950/30 to-purple-950/30 border border-indigo-800/30 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>Protected System Role</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This account holds platform ownership privileges. Changes to platform security policies will be recorded in global audit logs.
            </p>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-3xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" />
              <span>General Information</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Avatar Image URL</label>
                <input
                  type="url"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Bio / Title</label>
                <textarea
                  rows={2}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Lead Administrator & Platform Architect"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-3xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-400" />
              <span>Authentication & Password</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                >
                  <Key className="h-4 w-4" />
                  <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-[#0d1322] border border-slate-800/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Laptop className="h-5 w-5 text-indigo-400" />
                <span>Active Login Sessions</span>
              </h3>
              <span className="text-xs text-slate-400">{sessions.length} active session(s)</span>
            </div>

            <div className="space-y-2.5">
              {sessions.map((sess, idx) => (
                <div
                  key={sess.sessionId || sess.id || idx}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{sess.device || 'Desktop'}</span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sess.userAgent || 'Chrome Browser'} &bull; IP: {sess.ip || '127.0.0.1'}
                      </p>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(sess.sessionId || sess.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
                      title="Revoke session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
