import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserCheck,
  ClipboardList,
  CheckCircle2,
  Clock3,
  Search,
  X,
  Menu,
  ChevronRight,
  Filter,
  Calendar,
  AlertCircle,
  FolderKanban,
  ExternalLink,
  Briefcase,
  Mail,
  Eye,
  Check,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";

// Initial realistic team members dataset with detailed assigned tasks
export const initialTeamMembers = [
  {
    id: "tm-1",
    name: "Devanshi Sharma",
    email: "devanshi.sharma@worksync.io",
    role: "Engineering Manager",
    department: "Engineering",
    status: "Active",
    avatar: "DS",
    color: "from-blue-600 to-indigo-600",
    tasks: [
      {
        id: "task-4",
        title: "Configure role-based access control and manager route guards",
        project: "WorkSync Web App",
        priority: "High",
        dueDate: "Oct 30, 2026",
        status: "In Progress",
      },
      {
        id: "task-7",
        title: "Deploy staging environment and configure automated CI pipeline",
        project: "Real-Time Sync Engine",
        priority: "High",
        dueDate: "Nov 12, 2026",
        status: "To Do",
      },
      {
        id: "task-9",
        title: "SOC2 Type II compliance audit checklist verification",
        project: "Enterprise Security Audit",
        priority: "High",
        dueDate: "Oct 15, 2026",
        status: "Completed",
      },
      {
        id: "task-12",
        title: "Quarterly sprint capacity planning and roadmap alignment",
        project: "WorkSync Web App",
        priority: "Medium",
        dueDate: "Nov 20, 2026",
        status: "Completed",
      },
    ],
  },
  {
    id: "tm-2",
    name: "Ayan Mukherjee",
    email: "ayan.mukherjee@worksync.io",
    role: "Fullstack Admin",
    department: "Engineering",
    status: "Active",
    avatar: "AM",
    color: "from-cyan-500 to-blue-600",
    tasks: [
      {
        id: "task-1",
        title: "Implement WebSocket connection and live presence sync",
        project: "WorkSync Web App",
        priority: "High",
        dueDate: "Oct 18, 2026",
        status: "Completed",
      },
      {
        id: "task-5",
        title: "Audit client-side bundle size and verify Vite code splitting",
        project: "Mobile Companion App",
        priority: "Low",
        dueDate: "Nov 02, 2026",
        status: "In Review",
      },
      {
        id: "task-13",
        title: "Optimize Redis pub/sub channels for cursor presence",
        project: "Real-Time Sync Engine",
        priority: "High",
        dueDate: "Nov 05, 2026",
        status: "In Progress",
      },
      {
        id: "task-14",
        title: "Setup OAuth token rotation and session invalidation",
        project: "Enterprise Security Audit",
        priority: "High",
        dueDate: "Oct 25, 2026",
        status: "Completed",
      },
    ],
  },
  {
    id: "tm-3",
    name: "Rouhan Siddiqui",
    email: "rouhan.siddiqui@worksync.io",
    role: "Frontend Dev",
    department: "Engineering",
    status: "Active",
    avatar: "RS",
    color: "from-emerald-500 to-teal-600",
    tasks: [
      {
        id: "task-3",
        title: "Build Kanban board column state and status transition handlers",
        project: "WorkSync Web App",
        priority: "High",
        dueDate: "Oct 28, 2026",
        status: "In Progress",
      },
      {
        id: "task-6",
        title: "Write integration tests for sprint burn-down calculations",
        project: "WorkSync Web App",
        priority: "Medium",
        dueDate: "Nov 08, 2026",
        status: "To Do",
      },
      {
        id: "task-10",
        title: "Setup client onboarding template repository",
        project: "Client Onboarding Portal",
        priority: "Medium",
        dueDate: "Jan 10, 2027",
        status: "To Do",
      },
      {
        id: "task-15",
        title: "Refactor task filter dropdowns with keyboard navigation",
        project: "WorkSync Web App",
        priority: "Low",
        dueDate: "Oct 22, 2026",
        status: "Completed",
      },
    ],
  },
  {
    id: "tm-4",
    name: "Priya Patel",
    email: "priya.patel@worksync.io",
    role: "UI Designer",
    department: "Design",
    status: "Active",
    avatar: "PP",
    color: "from-violet-500 to-purple-600",
    tasks: [
      {
        id: "task-2",
        title: "Design light theme SaaS workspace layout and card tokens",
        project: "WorkSync Web App",
        priority: "Medium",
        dueDate: "Oct 20, 2026",
        status: "Completed",
      },
      {
        id: "task-16",
        title: "Create interactive Figma prototypes for mobile sprint views",
        project: "Mobile Companion App",
        priority: "High",
        dueDate: "Nov 15, 2026",
        status: "In Progress",
      },
      {
        id: "task-17",
        title: "Design iconography set and empty state illustrations",
        project: "WorkSync Web App",
        priority: "Low",
        dueDate: "Oct 19, 2026",
        status: "Completed",
      },
    ],
  },
  {
    id: "tm-5",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@worksync.io",
    role: "Mobile Engineer",
    department: "Engineering",
    status: "Active",
    avatar: "VM",
    color: "from-amber-500 to-orange-600",
    tasks: [
      {
        id: "task-8",
        title: "Mobile viewport regression tests and touch target verification",
        project: "Mobile Companion App",
        priority: "Medium",
        dueDate: "Nov 14, 2026",
        status: "To Do",
      },
      {
        id: "task-18",
        title: "Implement offline SQLite cache and sync queue for tasks",
        project: "Mobile Companion App",
        priority: "High",
        dueDate: "Nov 25, 2026",
        status: "In Progress",
      },
      {
        id: "task-19",
        title: "Setup push notification handler for urgent task mentions",
        project: "Mobile Companion App",
        priority: "Medium",
        dueDate: "Oct 24, 2026",
        status: "Completed",
      },
    ],
  },
  {
    id: "tm-6",
    name: "Neha Verma",
    email: "neha.verma@worksync.io",
    role: "Data Analyst",
    department: "Analytics",
    status: "Active",
    avatar: "NV",
    color: "from-fuchsia-500 to-pink-600",
    tasks: [
      {
        id: "task-11",
        title: "Executive velocity graphs and burn-down reporting export",
        project: "Analytics & Reporting Hub",
        priority: "Medium",
        dueDate: "Nov 28, 2026",
        status: "In Progress",
      },
      {
        id: "task-20",
        title: "Build automated CSV export pipeline for team workloads",
        project: "Analytics & Reporting Hub",
        priority: "Low",
        dueDate: "Oct 27, 2026",
        status: "Completed",
      },
    ],
  },
  {
    id: "tm-7",
    name: "Aarav Patel",
    email: "aarav.patel@worksync.io",
    role: "Frontend Dev",
    department: "Engineering",
    status: "Active",
    avatar: "AP",
    color: "from-sky-500 to-blue-600",
    tasks: [
      {
        id: "task-21",
        title: "Design dashboard UI component primitives and grid responsiveness",
        project: "WorkSync Web App",
        priority: "High",
        dueDate: "Nov 05, 2026",
        status: "In Progress",
      },
      {
        id: "task-22",
        title: "Implement breadcrumb navigation and page title synchronization",
        project: "WorkSync Web App",
        priority: "Low",
        dueDate: "Oct 26, 2026",
        status: "Completed",
      },
    ],
  },
  {
    id: "tm-8",
    name: "Rohan Mehta",
    email: "rohan.mehta@worksync.io",
    role: "Backend Engineer",
    department: "Engineering",
    status: "Inactive",
    avatar: "RM",
    color: "from-slate-500 to-slate-700",
    tasks: [
      {
        id: "task-23",
        title: "Historical audit log archival migration script",
        project: "Enterprise Security Audit",
        priority: "Medium",
        dueDate: "Sep 30, 2026",
        status: "Completed",
      },
    ],
  },
  {
    id: "tm-9",
    name: "Priya Shah",
    email: "priya.shah@worksync.io",
    role: "QA Engineer",
    department: "Quality Assurance",
    status: "Inactive",
    avatar: "PS",
    color: "from-slate-400 to-slate-600",
    tasks: [],
  },
];

// Badge & styling maps consistent with existing pages
const priorityStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-200/80",
  Medium: "bg-amber-50 text-amber-700 border-amber-200/80",
  Low: "bg-slate-100 text-slate-600 border-slate-200/80",
};

const taskStatusStyles = {
  "To Do": "bg-slate-100 text-slate-700 border-slate-200/80",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200/80",
  "In Review": "bg-purple-50 text-purple-700 border-purple-200/80",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
};

const memberStatusStyles = {
  Active: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  Inactive: {
    badge: "bg-slate-100 text-slate-600 border-slate-200/80",
    dot: "bg-slate-400",
  },
};

const TeamPage = () => {
  const [members] = useState(initialTeamMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedMember(null);
      }
    };
    if (selectedMember) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMember]);

  // Extract unique roles for the filter dropdown
  const distinctRoles = useMemo(() => {
    const rolesSet = new Set(members.map((m) => m.role));
    return Array.from(rolesSet).sort();
  }, [members]);

  // High-level summary calculations (always derived dynamically from the member dataset)
  const overviewStats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === "Active").length;
    const totalAssignedTasks = members.reduce(
      (sum, m) => sum + m.tasks.length,
      0
    );
    const completedTasks = members.reduce(
      (sum, m) =>
        sum + m.tasks.filter((t) => t.status === "Completed").length,
      0
    );

    return {
      totalMembers,
      activeMembers,
      totalAssignedTasks,
      completedTasks,
    };
  }, [members]);

  // Filtered members list based on search, status, and role
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query);

      const matchesStatus =
        selectedStatus === "All" || member.status === selectedStatus;

      const matchesRole =
        selectedRole === "All" || member.role === selectedRole;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [members, searchQuery, selectedStatus, selectedRole]);

  // Status counts for filter tabs
  const statusCounts = useMemo(() => {
    return {
      All: members.length,
      Active: members.filter((m) => m.status === "Active").length,
      Inactive: members.filter((m) => m.status === "Inactive").length,
    };
  }, [members]);

  // Reset all applied filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedRole("All");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Scroll-Fixed Sidebar Component */}
      <Sidebar
        activeItem="team"
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Top Header Bar with Required Breadcrumb */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={18} />
              </button>

              {/* Breadcrumb: Home > Team Members */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Home</span>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="font-medium text-blue-600">Team Members</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Title & Intro */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Team Members
                </h1>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/80">
                  {members.length}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                View team members, monitor workload distribution, and inspect assigned tasks.
              </p>
            </div>
          </div>

          {/* 1. Team Members Overview: Summary Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              icon={<Users size={19} />}
              label="Total Team Members"
              value={overviewStats.totalMembers}
              iconColor="bg-blue-50 text-blue-600 border-blue-100"
            />
            <SummaryCard
              icon={<UserCheck size={19} />}
              label="Active Members"
              value={overviewStats.activeMembers}
              iconColor="bg-emerald-50 text-emerald-600 border-emerald-100"
            />
            <SummaryCard
              icon={<ClipboardList size={19} />}
              label="Total Assigned Tasks"
              value={overviewStats.totalAssignedTasks}
              iconColor="bg-indigo-50 text-indigo-600 border-indigo-100"
            />
            <SummaryCard
              icon={<CheckCircle2 size={19} />}
              label="Completed Tasks"
              value={overviewStats.completedTasks}
              iconColor="bg-teal-50 text-teal-600 border-teal-100"
            />
          </section>

          {/* 2. Controls: Search, Status Tabs, and Role Filter */}
          <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["All", "Active", "Inactive"].map((status) => {
                  const isSelected = selectedStatus === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 border border-blue-200/80"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span>{status}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                          isSelected
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {statusCounts[status]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search and Role Filter Inputs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Search by Name or Email */}
                <div className="relative w-full sm:w-64 md:w-72">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Role Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    {distinctRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Team Members List Table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  All Team Members
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Click on any member to inspect their assigned tasks and current delivery status.
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">Member</th>
                    <th className="px-5 py-3.5 font-semibold">Role</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Assigned Tasks</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Completed</th>
                    <th className="px-5 py-3.5 font-semibold text-center">Pending</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => {
                    const assignedCount = member.tasks.length;
                    const completedCount = member.tasks.filter(
                      (t) => t.status === "Completed"
                    ).length;
                    const pendingCount = assignedCount - completedCount;
                    const statusConfig =
                      memberStatusStyles[member.status] || memberStatusStyles.Active;

                    return (
                      <tr
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        {/* Member Avatar, Name, and Email */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${member.color} text-xs font-bold text-white shadow-xs`}
                            >
                              {member.avatar}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {member.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200/60">
                            {member.role}
                          </span>
                        </td>

                        {/* Status (Active / Inactive) */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                            ></span>
                            {member.status}
                          </span>
                        </td>

                        {/* Assigned Tasks Count */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                            {assignedCount}
                          </span>
                        </td>

                        {/* Completed Tasks Count */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 size={12} />
                            {completedCount}
                          </span>
                        </td>

                        {/* Pending Tasks Count */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60">
                            <Clock3 size={12} />
                            {pendingCount}
                          </span>
                        </td>

                        {/* Action: View Tasks */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMember(member);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200/70 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100/70 hover:text-blue-800 transition shadow-2xs"
                          >
                            <Eye size={13} />
                            <span>View Tasks</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty state when no members match search or filters */}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                          <Users size={22} />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          No team members found
                        </p>
                        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                          No members match your search criteria or active filters. Try clearing your filters to see all team members.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                        >
                          Reset filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* 4. Member Task Details Modal */}
      {selectedMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedMember(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="border-b border-slate-100 p-5 bg-gradient-to-r from-slate-50/70 to-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedMember.color} text-sm font-bold text-white shadow-xs`}
                  >
                    {selectedMember.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        id="member-modal-title"
                        className="text-base font-bold text-slate-900"
                      >
                        {selectedMember.name}
                      </h3>
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/60">
                        {selectedMember.role}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          memberStatusStyles[selectedMember.status]?.badge ||
                          memberStatusStyles.Active.badge
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            memberStatusStyles[selectedMember.status]?.dot ||
                            memberStatusStyles.Active.dot
                          }`}
                        ></span>
                        {selectedMember.status}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Mail size={12} className="text-slate-400" />
                      <span>{selectedMember.email}</span>
                      <span className="text-slate-300">•</span>
                      <span>{selectedMember.department}</span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                  aria-label="Close dialog"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Member Quick Task Stats Bar inside modal */}
              <div className="mt-4 grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-center">
                <div className="rounded-xl bg-slate-50/80 p-2.5 border border-slate-100">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">
                    Assigned Tasks
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedMember.tasks.length}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50/60 p-2.5 border border-emerald-100/60">
                  <p className="text-[10px] uppercase font-semibold text-emerald-700">
                    Completed
                  </p>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">
                    {
                      selectedMember.tasks.filter((t) => t.status === "Completed")
                        .length
                    }
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50/60 p-2.5 border border-amber-100/60">
                  <p className="text-[10px] uppercase font-semibold text-amber-700">
                    Pending
                  </p>
                  <p className="text-lg font-bold text-amber-700 mt-0.5">
                    {
                      selectedMember.tasks.filter((t) => t.status !== "Completed")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body: Task List */}
            <div className="p-5 overflow-y-auto space-y-3 max-h-[50vh] [scrollbar-width:thin]">
              <div className="flex items-center justify-between pb-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Assigned Tasks ({selectedMember.tasks.length})
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  Priority & Deadlines
                </span>
              </div>

              {selectedMember.tasks.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedMember.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200/90 bg-white p-4 hover:border-blue-200 transition-colors shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h5 className="font-semibold text-xs sm:text-sm text-slate-900 leading-snug">
                            {task.title}
                          </h5>
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <FolderKanban size={13} className="text-blue-600 shrink-0" />
                            <span className="font-medium text-slate-700">
                              {task.project}
                            </span>
                          </div>
                        </div>

                        {/* Task Status Pill */}
                        <span
                          className={`shrink-0 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            taskStatusStyles[task.status] ||
                            taskStatusStyles["To Do"]
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      {/* Task Meta: Priority & Due Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">
                            Priority:
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.2 text-[10px] font-bold ${
                              priorityStyles[task.priority] || priorityStyles.Low
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <Calendar size={12} className="text-slate-400" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty tasks state */
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-2.5">
                    <ClipboardList size={18} />
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    No tasks assigned yet
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                    This team member does not have any active or completed tasks assigned at this moment.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-3">
              <span className="text-[11px] text-slate-500">
                Press <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold border border-slate-200 shadow-2xs">Esc</kbd> to close
              </span>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="rounded-xl bg-slate-200/80 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300/80 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Summary Card Component (matches AssignmentsPage pattern)
function SummaryCard({ icon, label, value, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default TeamPage;
