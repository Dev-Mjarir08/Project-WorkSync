import React, { useState } from "react";
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
import { getCurrentUser, getUserItem, setUserItem } from "../../../utils/userStorage.js";

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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Lock size={19} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Password & Security
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Manage your account security through your authentication settings.
                      </p>
                    </div>
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