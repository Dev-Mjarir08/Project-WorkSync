import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  Save,
  X,
  Lock,
  ShieldCheck,
  Bell,
  ChevronRight,
  CheckCircle2,
  Laptop,
  Smartphone,
  Monitor,
  Trash2,
  LogOut,
  RefreshCw,
  Globe,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import { getCurrentUser, getUserItem, setUserItem } from "../../../utils/userStorage.js";
import { authService } from "../../auth/authService.js";
import managerService from "../managerService.js";

const getInitialProfile = () => {
  const saved = getUserItem("manager_profile", null);
  if (saved) return saved;

  const user = getCurrentUser();
  const nameParts = (user?.name || "Project Manager").trim().split(/\s+/);
  return {
    firstName: nameParts[0] || "Project",
    lastName: nameParts.slice(1).join(" ") || "Manager",
    email: user?.email || "manager@worksync.com",
    phone: "+91 98765 43210",
    role: user?.role === "manager" ? "Project Manager" : user?.role || "Project Manager",
    department: "Management",
    location: "Ahmedabad, Gujarat, India",
    bio: "Experienced project manager focused on team collaboration, project delivery, and improving productivity.",
    joinedDate: "2026",
  };
};

const ProfilePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(getInitialProfile);
  const [formData, setFormData] = useState(getInitialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [successMessage, setSuccessMessage] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Active Sessions & Devices State (GET /api/v1/manager/profile/sessions)
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const loadSessions = () => {
    setSessionsLoading(true);
    managerService
      .getSessions()
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load sessions:", err);
      })
      .finally(() => {
        setSessionsLoading(false);
      });
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Remote Session Revocation (DELETE /api/v1/manager/profile/sessions/:sessionId)
  const handleRevokeSession = async (sessionId, deviceName) => {
    if (!window.confirm(`Revoke session for ${deviceName || "this device"}? You will be signed out on that device.`)) {
      return;
    }

    setRevokingId(sessionId);
    try {
      await managerService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => (s.id || s._id) !== sessionId));
      setSessionMessage({ type: "success", text: "Session revoked successfully." });
    } catch (err) {
      setSessionMessage({ type: "error", text: err.message || "Failed to revoke session." });
    } finally {
      setRevokingId(null);
      setTimeout(() => setSessionMessage(null), 3500);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setUpdatingPassword(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        email: profile.email,
      });
      setPasswordSuccess("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const fullName = `${profile.firstName} ${profile.lastName}`;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
    setSuccessMessage("");
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleSave = (event) => {
    event.preventDefault();

    setProfile(formData);
    setUserItem("manager_profile", formData);
    setIsEditing(false);
    setSuccessMessage("Profile updated successfully.");

    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
      <Sidebar
        activeItem="profile"
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Header */}
        <Header setMobileOpen={setMobileMenuOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              <CheckCircle2 size={18} />
              {successMessage}
            </div>
          )}

          {/* Profile Banner */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 relative">
              <div className="absolute inset-0 opacity-10">
                <div className="w-64 h-64 rounded-full border-[30px] border-white absolute -right-10 -top-32" />
                <div className="w-48 h-48 rounded-full border-[20px] border-white absolute right-64 -bottom-32" />
              </div>
            </div>

            <div className="px-5 sm:px-8 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 relative">
                <div className="flex items-end gap-4">
                  <div className="w-24 h-24 rounded-2xl border-4 border-white bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold shadow-sm">
                    {profile.firstName.charAt(0)}
                    {profile.lastName.charAt(0)}
                  </div>

                  <div className="pb-1">
                    <h2 className="text-xl font-bold text-slate-800">
                      {fullName}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {profile.role}
                    </p>
                  </div>
                </div>

                {!isEditing && activeTab === "profile" && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Mail size={15} />
                  {profile.email}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={15} />
                  {profile.location}
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  Manager Account
                </span>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => handleTabChange("profile")}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === "profile"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <User size={16} />
                Personal Information
              </span>
            </button>

            <button
              onClick={() => handleTabChange("account")}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === "account"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={16} />
                Account Information
              </span>
            </button>

            <button
              onClick={() => handleTabChange("preferences")}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === "preferences"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <Bell size={16} />
                Preferences
              </span>
            </button>
          </div>

          {/* Personal Information */}
          {activeTab === "profile" && (
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-800">
                    Personal Information
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Update your personal and professional details.
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="sm:hidden p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                    aria-label="Edit profile"
                  >
                    <Edit3 size={18} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="First Name"
                    name="firstName"
                    value={isEditing ? formData.firstName : profile.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter first name"
                  />

                  <FormField
                    label="Last Name"
                    name="lastName"
                    value={isEditing ? formData.lastName : profile.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter last name"
                  />

                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={isEditing ? formData.email : profile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter email address"
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    value={isEditing ? formData.phone : profile.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                  />

                  <FormField
                    label="Job Title"
                    name="role"
                    value={isEditing ? formData.role : profile.role}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter job title"
                  />

                  <FormField
                    label="Department"
                    name="department"
                    value={isEditing ? formData.department : profile.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter department"
                  />

                  <div className="sm:col-span-2">
                    <FormField
                      label="Location"
                      name="location"
                      value={isEditing ? formData.location : profile.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your location"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      About Me
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      disabled={!isEditing}
                      value={isEditing ? formData.bio : profile.bio}
                      onChange={handleChange}
                      placeholder="Write something about yourself..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-500 resize-none"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <X size={16} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </section>
          )}

          {/* Account Information */}
          {activeTab === "account" && (
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-800">
                  Account Information
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Your WorkSync account details.
                </p>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                <InfoRow
                  icon={<BriefcaseBusiness size={19} />}
                  label="Account Role"
                  value="Manager"
                />
                <InfoRow
                  icon={<ShieldCheck size={19} />}
                  label="Account Status"
                  value="Active"
                  success
                />
                <InfoRow
                  icon={<CalendarDays size={19} />}
                  label="Member Since"
                  value={profile.joinedDate}
                />
                <InfoRow
                  icon={<Mail size={19} />}
                  label="Registered Email"
                  value={profile.email}
                />

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Lock size={19} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Password & Security
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Change your account password and security credentials.
                        </p>
                      </div>
                    </div>

                    {!showPasswordForm && (
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(true)}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition self-start sm:self-auto cursor-pointer"
                      >
                        Change Password
                      </button>
                    )}
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3.5">
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

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Current password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Min 6 characters"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            placeholder="Repeat new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordError("");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={updatingPassword}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                          {updatingPassword ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Active Sessions & Devices (GET /api/v1/manager/profile/sessions & DELETE /api/v1/manager/profile/sessions/:sessionId) */}
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Monitor size={19} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            Active Devices &amp; Browser Sessions
                          </p>
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                            {sessions.length}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Devices and browsers currently logged into your manager account. Revoke any unrecognized sessions.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={loadSessions}
                      disabled={sessionsLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition self-start sm:self-auto cursor-pointer"
                    >
                      <RefreshCw size={13} className={sessionsLoading ? "animate-spin text-blue-600" : "text-slate-400"} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {sessionMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs font-medium mb-3 flex items-center gap-2 border ${
                        sessionMessage.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-rose-50 text-rose-800 border-rose-200"
                      }`}
                    >
                      {sessionMessage.type === "success" ? (
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle size={14} className="text-rose-600 shrink-0" />
                      )}
                      <span>{sessionMessage.text}</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {sessionsLoading && sessions.length === 0 ? (
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 text-center text-xs text-slate-400 animate-pulse">
                        Loading active device sessions...
                      </div>
                    ) : sessions.length > 0 ? (
                      sessions.map((sess) => {
                        const sessId = sess.id || sess._id;
                        const isCurrent = sess.isCurrent || sess.id === "sess_current" || sess.userAgent?.includes("Current Browser");
                        const deviceName = sess.device || sess.userAgent || "Desktop Browser";
                        const ipAddress = sess.ip || "127.0.0.1";
                        const isMobile = /mobile|phone|android|iphone/i.test(deviceName);

                        return (
                          <div
                            key={sessId}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                              isCurrent ? "border-blue-200 bg-blue-50/20" : "border-slate-100 bg-slate-50/50 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isCurrent ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {isMobile ? <Smartphone size={16} /> : <Laptop size={16} />}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-slate-800 truncate">{deviceName}</p>
                                  {isCurrent && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-bold text-emerald-800">
                                      This Device
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-slate-400 font-mono">
                                  <span>IP: {ipAddress}</span>
                                  <span>•</span>
                                  <span>
                                    Last Active: {sess.lastActive ? new Date(sess.lastActive).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {!isCurrent && (
                              <button
                                type="button"
                                disabled={revokingId === sessId}
                                onClick={() => handleRevokeSession(sessId, deviceName)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition self-start sm:self-auto cursor-pointer disabled:opacity-50"
                                title="Revoke session on this device"
                              >
                                <LogOut size={12} />
                                <span>{revokingId === sessId ? "Revoking..." : "Revoke Access"}</span>
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic py-3 text-center">No other active sessions detected.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Preferences */}
          {activeTab === "preferences" && (
            <PreferencesSection />
          )}
        </main>
      </div>
    </div>
  );
};

const FormField = ({
  label,
  name,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-500"
    />
  </div>
);

const InfoRow = ({ icon, label, value, success }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1">{value}</p>
    </div>
    {success && (
      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
        Active
      </span>
    )}
  </div>
);

const PreferencesSection = () => {
  const [preferences, setPreferences] = useState({
    taskUpdates: true,
    projectUpdates: true,
    emailNotifications: false,
    deadlineReminders: true,
  });

  const togglePreference = (key) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const options = [
    {
      key: "taskUpdates",
      title: "Task Updates",
      description: "Receive updates when tasks are assigned or completed.",
    },
    {
      key: "projectUpdates",
      title: "Project Updates",
      description: "Get notified about important project changes.",
    },
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive notifications through your email.",
    },
    {
      key: "deadlineReminders",
      title: "Deadline Reminders",
      description: "Get reminders about upcoming task deadlines.",
    },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <h2 className="font-bold text-slate-800">Notification Preferences</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose which notifications you want to receive.
        </p>
      </div>

      <div className="p-5 sm:p-6 divide-y divide-slate-100">
        {options.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
          >
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                {option.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {option.description}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={preferences[option.key]}
              onClick={() => togglePreference(option.key)}
              className={`relative w-11 h-6 rounded-full shrink-0 transition ${
                preferences[option.key] ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                  preferences[option.key] ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProfilePage;