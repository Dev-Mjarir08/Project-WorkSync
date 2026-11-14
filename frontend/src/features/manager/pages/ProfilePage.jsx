import React, { useEffect, useState } from "react";
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
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import managerService from "../managerService.js";

const emptyProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  location: "",
  bio: "",
  joinedDate: "",
  avatar: "",
  accountStatus: "Unknown",
};

const normalizeProfile = (apiProfile, previous = emptyProfile) => {
  const [firstName = "", ...lastNameParts] = String(apiProfile.name || "").trim().split(/\s+/);
  return {
    ...previous,
    firstName,
    lastName: lastNameParts.join(" "),
    email: apiProfile.email || "",
    role: apiProfile.workspaceRole || apiProfile.role || previous.role || "Manager",
    bio: apiProfile.bio || "",
    joinedDate: apiProfile.createdAt
      ? new Date(apiProfile.createdAt).toLocaleDateString()
      : previous.joinedDate || "Unavailable",
    avatar: apiProfile.avatar || previous.avatar || "",
    accountStatus: apiProfile.isActive === false ? "Inactive" : "Active",
  };
};

const ProfilePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(emptyProfile);
  const [formData, setFormData] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingSession, setRevokingSession] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const apiProfile = await managerService.getProfile();
      const normalized = normalizeProfile(apiProfile);
      setProfile(normalized);
      setFormData(normalized);
    } catch (loadError) {
      setError(loadError.message || "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab !== "account") return;
    setSessionsLoading(true);
    managerService.getSessions()
      .then((result) => {
        if (!Array.isArray(result?.sessions)) {
          throw new Error("The Manager API returned an invalid sessions response.");
        }
        setSessions(result.sessions);
      })
      .catch((loadError) => setError(loadError.message || "Unable to load active sessions."))
      .finally(() => setSessionsLoading(false));
  }, [activeTab]);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

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
      await managerService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
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

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Manager profile";

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

  const handleSave = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setError("");
    setSuccessMessage("");
    try {
      const apiProfile = await managerService.updateProfile({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        bio: formData.bio,
      });
      let updatedProfile = normalizeProfile(apiProfile, profile);
      if (formData.avatar.trim() && formData.avatar !== profile.avatar) {
        const avatarResult = await managerService.updateAvatar(formData.avatar.trim());
        updatedProfile = { ...updatedProfile, avatar: avatarResult.avatar || formData.avatar.trim() };
      }
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError.message || "Unable to update your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const revokeSession = async (sessionId) => {
    setRevokingSession(sessionId);
    setError("");
    try {
      await managerService.revokeSession(sessionId);
      const result = await managerService.getSessions();
      setSessions(result.sessions);
    } catch (revokeError) {
      setError(revokeError.message || "Unable to revoke the session.");
    } finally {
      setRevokingSession("");
    }
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
          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              Loading profile...
            </div>
          )}
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
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="" className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-sm" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl border-4 border-white bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold shadow-sm">
                      {profile.firstName.charAt(0)}
                      {profile.lastName.charAt(0)}
                    </div>
                  )}

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
                  {profile.location || "Location not provided"}
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
                    disabled={!isEditing || loading || savingProfile}
                    placeholder="Enter first name"
                  />

                  <FormField
                    label="Last Name"
                    name="lastName"
                    value={isEditing ? formData.lastName : profile.lastName}
                    onChange={handleChange}
                    disabled={!isEditing || loading || savingProfile}
                    placeholder="Enter last name"
                  />

                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={isEditing ? formData.email : profile.email}
                    onChange={handleChange}
                    disabled={!isEditing || loading || savingProfile}
                    placeholder="Enter email address"
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    value={isEditing ? formData.phone : profile.phone}
                    onChange={handleChange}
                    disabled
                    placeholder="Enter phone number"
                  />

                  <FormField
                    label="Job Title"
                    name="role"
                    value={profile.role}
                    onChange={handleChange}
                    disabled
                    placeholder="Enter job title"
                  />

                  <FormField
                    label="Department"
                    name="department"
                    value={isEditing ? formData.department : profile.department}
                    onChange={handleChange}
                    disabled
                    placeholder="Enter department"
                  />

                  <div className="sm:col-span-2">
                    <FormField
                      label="Location"
                      name="location"
                      value={isEditing ? formData.location : profile.location}
                      onChange={handleChange}
                      disabled
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
                      disabled={!isEditing || loading || savingProfile}
                      value={isEditing ? formData.bio : profile.bio}
                      onChange={handleChange}
                      placeholder="Write something about yourself..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-500 resize-none"
                    />
                  </div>
                </div>

                {isEditing && (
                  <p className="text-xs text-slate-500">
                    Phone, job title, department, and location are not editable because the Manager profile API does not support them.
                  </p>
                )}

                {isEditing && (
                  <FormField
                    label="Avatar URL"
                    name="avatar"
                    type="url"
                    value={formData.avatar}
                    onChange={handleChange}
                    disabled={loading || savingProfile}
                    placeholder="https://..."
                  />
                )}

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
                      disabled={savingProfile || loading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save size={16} />
                      {savingProfile ? "Saving..." : "Save Changes"}
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
                  value={profile.role || "Manager"}
                />
                <InfoRow
                  icon={<ShieldCheck size={19} />}
                  label="Account Status"
                  value={profile.accountStatus}
                  success={profile.accountStatus === "Active"}
                />
                <InfoRow
                  icon={<CalendarDays size={19} />}
                  label="Member Since"
                  value={profile.joinedDate || "Unavailable"}
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

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Active Sessions</h3>
                  {sessionsLoading ? (
                    <p className="mt-3 text-sm text-slate-500">Loading active sessions...</p>
                  ) : sessions.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">No active sessions reported.</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {sessions.map((session) => {
                        const sessionId = session.id || session._id;
                        return (
                          <div key={sessionId} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-800">{session.device || session.userAgent || "Session"}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {session.ip || "IP unavailable"} · Last active {session.lastActive ? new Date(session.lastActive).toLocaleString() : "unknown"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => revokeSession(sessionId)}
                              disabled={!sessionId || revokingSession === sessionId}
                              className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            >
                              {revokingSession === sessionId ? "Revoking..." : "Revoke"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    managerService.getNotificationSettings()
      .then(setPreferences)
      .catch((loadError) => setError(loadError.message || "Unable to load notification settings."))
      .finally(() => setLoading(false));
  }, []);

  const togglePreference = async (key) => {
    setSavingKey(key);
    setError("");
    try {
      const settings = await managerService.updateNotificationSettings({
        [key]: !preferences[key],
      });
      setPreferences(settings);
    } catch (saveError) {
      setError(saveError.message || "Unable to update notification settings.");
    } finally {
      setSavingKey("");
    }
  };

  const options = [
    {
      key: "taskAlerts",
      title: "Task Alerts",
      description: "Receive updates when tasks are assigned or completed.",
    },
    {
      key: "announcementsAlerts",
      title: "Announcements",
      description: "Get notified about important workspace announcements.",
    },
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Receive notifications through your email.",
    },
    {
      key: "weeklyDigest",
      title: "Weekly Digest",
      description: "Receive a weekly summary of workspace activity.",
    },
    {
      key: "inAppNotifications",
      title: "In-app Notifications",
      description: "Show notifications inside WorkSync.",
    },
    {
      key: "mentionAlerts",
      title: "Mention Alerts",
      description: "Receive alerts when you are mentioned.",
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

      {error && <p role="alert" className="px-5 pt-4 text-sm text-rose-700">{error}</p>}
      {loading && <p className="px-5 pt-4 text-sm text-slate-500">Loading preferences...</p>}
      <div className="p-5 sm:p-6 divide-y divide-slate-100">
        {!loading && preferences && options.map((option) => (
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
              disabled={Boolean(savingKey)}
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