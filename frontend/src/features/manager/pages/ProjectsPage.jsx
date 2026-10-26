import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  ChevronRight,
  ArrowRight,
  FolderKanban,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";

// Standard realistic project catalog (exported for Boards, Details, and Tasks pages)
export const initialProjects = [
  {
    id: "proj-1",
    name: "WorkSync Web App",
    description:
      "Next-generation collaborative workspace suite featuring real-time task boards, live presence, and team workload analytics.",
    status: "Active",
    category: "Core Platform",
    priority: "High",
    progress: 72,
    totalTasks: 25,
    completedTasks: 18,
    deadline: "Nov 12, 2026",
    boardId: "board-1",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
      { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
      { name: "Priya Patel", role: "UI Designer", avatar: "PP", color: "from-violet-500 to-purple-600" },
    ],
  },
  {
    id: "proj-2",
    name: "Mobile Companion App",
    description:
      "Cross-platform iOS and Android app for on-the-go sprint updates, instant task assignment notifications, and offline sync.",
    status: "Active",
    category: "Mobile",
    priority: "High",
    progress: 45,
    totalTasks: 20,
    completedTasks: 9,
    deadline: "Dec 05, 2026",
    boardId: "board-2",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
      { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
      { name: "Vikram Malhotra", role: "Mobile Engineer", avatar: "VM", color: "from-amber-500 to-orange-600" },
    ],
  },
  {
    id: "proj-3",
    name: "Real-Time Sync Engine",
    description:
      "Low-latency WebSocket event mesh ensuring sub-50ms synchronization across concurrent board edits and cursor presence.",
    status: "Active",
    category: "Infrastructure",
    priority: "Medium",
    progress: 85,
    totalTasks: 14,
    completedTasks: 12,
    deadline: "Oct 30, 2026",
    boardId: "board-3",
    team: [
      { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
    ],
  },
  {
    id: "proj-4",
    name: "Enterprise Security Audit",
    description:
      "SOC2 Type II compliance audit, role-based access policy enforcement, and automated token invalidation protocols.",
    status: "Completed",
    category: "Security",
    priority: "High",
    progress: 100,
    totalTasks: 16,
    completedTasks: 16,
    deadline: "Oct 15, 2026",
    boardId: "board-4",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
      { name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
    ],
  },
  {
    id: "proj-5",
    name: "Client Onboarding Portal",
    description:
      "Interactive customer setup flow, guided workspace tour templates, and automated invite provisioning for enterprise clients.",
    status: "On Hold",
    category: "Product",
    priority: "Medium",
    progress: 30,
    totalTasks: 10,
    completedTasks: 3,
    deadline: "Jan 10, 2027",
    boardId: "board-5",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
    ],
  },
  {
    id: "proj-6",
    name: "Analytics & Reporting Hub",
    description:
      "Executive velocity graphs, sprint burn-down projections, and custom CSV/PDF export generation for stakeholders.",
    status: "Active",
    category: "Analytics",
    priority: "Medium",
    progress: 60,
    totalTasks: 15,
    completedTasks: 9,
    deadline: "Nov 28, 2026",
    boardId: "board-6",
    team: [
      { name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
      { name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
      { name: "Neha Verma", role: "Data Analyst", avatar: "NV", color: "from-violet-500 to-fuchsia-600" },
    ],
  },
];

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-blue-50 text-blue-700 border-blue-200",
  "On Hold": "bg-amber-50 text-amber-700 border-amber-200",
};

const statusDotColors = {
  Active: "bg-emerald-500",
  Completed: "bg-blue-500",
  "On Hold": "bg-amber-500",
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter projects by search query and status
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === "All" || project.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
  };

  const handleCardClick = (projectId) => {
    navigate(`/manager/projects/${projectId}`);
  };

  // Status counts for compact tabs
  const counts = useMemo(() => {
    return {
      All: projects.length,
      Active: projects.filter((p) => p.status === "Active").length,
      Completed: projects.filter((p) => p.status === "Completed").length,
      "On Hold": projects.filter((p) => p.status === "On Hold").length,
    };
  }, [projects]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Scroll-Fixed Sidebar Component */}
      <Sidebar activeItem="projects" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Trigger & Breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={18} />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">WorkSync</span>
                <ChevronRight size={13} className="text-slate-400" />
                <span>Manager</span>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="font-medium text-blue-600">Projects</span>
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
                  Projects
                </h1>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/80">
                  {projects.length}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Manage projects, monitor progress, and track team delivery.
              </p>
            </div>
          </div>

          {/* Search and Status Filter Controls */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Active", "Completed", "On Hold"].map((status) => {
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
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isSelected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {counts[status]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </section>

          {/* Project Cards Grid */}
          {filteredProjects.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const statusStyle = statusStyles[project.status] || statusStyles.Active;
                const dotColor = statusDotColors[project.status] || "bg-emerald-500";

                return (
                  <div
                    key={project.id}
                    onClick={() => handleCardClick(project.id)}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div>
                      {/* Top: Project Name & One Clear Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {project.name}
                        </h2>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyle}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
                          {project.status}
                        </span>
                      </div>

                      {/* Description: Limited to 2 Lines */}
                      <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="mt-5 space-y-3">
                      {/* Simple Progress Bar and Task Summary */}
                      {typeof project.progress === "number" && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-500 text-[11px]">
                              {project.completedTasks} of {project.totalTasks} tasks completed
                            </span>
                            <span className="font-semibold text-slate-700">{project.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Understated View Project Action */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition">
                          <span>View Project</span>
                          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <FolderKanban size={24} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">No projects found</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
                We couldn't find any projects matching your search query or selected filter.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectsPage;
