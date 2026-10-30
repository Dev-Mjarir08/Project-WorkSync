import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  Bell,
  Lock,
  Camera,
  Save,
  CheckCircle2,
  Calendar,
  Sparkles,
  Smartphone,
  ExternalLink,
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isSaved, setIsSaved] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState({
    fullName: "Rouhan",
    role: "Frontend Developer",
    department: "Engineering & Product",
    email: "rouhan@worksync.io",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    bio: "Passionate Frontend Developer focused on React.js, Tailwind CSS, and crafting intuitive employee productivity tools.",
    twoFactor: true,
    emailAlerts: true,
    slackAlerts: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const stats = [
    { label: "Completed Tasks", value: "118" },
    { label: "Active Projects", value: "4" },
    { label: "On-Time Rate", value: "98.4%" },
    { label: "Joined", value: "Jan 2025" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Top Banner & Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Cover Gradient */}
        <div className="h-36 w-full bg-gradient-to-r from-teal-800 via-teal-600 to-slate-900 sm:h-44">
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
        </div>

        {/* Profile Content Brief */}
        <div className="px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              {/* Avatar with Camera Badge */}
              <div className="relative -mt-16 flex h-24 w-24 items-center justify-center rounded-3xl bg-teal-600 text-3xl font-extrabold text-white shadow-xl ring-4 ring-white dark:ring-slate-900 sm:-mt-20 sm:h-28 sm:w-28">
                R
                <button
                  aria-label="Upload photo"
                  className="absolute -bottom-1 -right-1 rounded-xl bg-slate-900 p-2 text-white shadow-md hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <Camera size={15} />
                </button>
              </div>

              {/* Identity & Badges */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                    {formData.fullName}
                  </h1>
                  <ShieldCheck size={20} className="text-teal-600 dark:text-teal-400" />
                </div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {formData.role} • {formData.department}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    {formData.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail size={14} className="text-slate-400" />
                    {formData.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 rounded-2xl bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Member
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/40"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800">
        {[
          { id: "personal", label: "Personal Details", icon: User },
          { id: "security", label: "Security & Login", icon: Lock },
          { id: "notifications", label: "Notifications", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
                isActive
                  ? "border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Personal Details */}
      {activeTab === "personal" && (
        <form
          onSubmit={handleSave}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Personal Information
              </h2>
              <p className="text-xs text-slate-400">
                Update your contact details and biography shown across the workspace
              </p>
            </div>

            {isSaved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} /> Saved Successfully
              </span>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Full Name
              </label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Job Title / Role
              </label>
              <div className="relative mt-1.5">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Phone Number
              </label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                Bio & About
              </label>
              <textarea
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="mt-1.5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Tab Content 2: Security */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Password & Authentication
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Manage authentication keys and security protocols
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Two-Factor Authentication (2FA)
                    </p>
                    <p className="text-xs text-slate-400">
                      Add an extra layer of security using an authenticator app
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="twoFactor"
                  checked={formData.twoFactor}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Change Password
                  </p>
                  <p className="text-xs text-slate-400">
                    Last updated 45 days ago
                  </p>
                </div>
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Notifications */}
      {activeTab === "notifications" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Notification Preferences
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Control which updates you receive via email and workspace push messages
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Email Task Digest
                </p>
                <p className="text-xs text-slate-400">
                  Receive a daily summary of overdue and assigned tasks
                </p>
              </div>
              <input
                type="checkbox"
                name="emailAlerts"
                checked={formData.emailAlerts}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Discussion Channel Mentions
                </p>
                <p className="text-xs text-slate-400">
                  Notify when tagged directly in employee channels
                </p>
              </div>
              <input
                type="checkbox"
                name="slackAlerts"
                checked={formData.slackAlerts}
                onChange={handleChange}
                className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}