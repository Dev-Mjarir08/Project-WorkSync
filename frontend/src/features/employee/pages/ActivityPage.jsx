import React, { useState, useMemo } from "react";
import {
  Activity,
  Search,
  Filter,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Users,
  GitCommit,
  Shield,
  MessageSquare,
  Star,
  Download,
  Plus,
  ArrowUpRight,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  List,
  GitBranch,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
  BarChart2,
  Layers,
  Info
} from "lucide-react";

// Initial Activity Mock Data
const initialActivities = [
  {
    id: "act-101",
    title: "Completed responsive navbar & dark mode",
    description: "Merged PR #142 containing full Tailwind responsiveness fixes and seamless dark mode support across components.",
    project: "WorkSync Platform",
    category: "Code/Builds",
    type: "Completed",
    user: {
      name: "Alex Morgan",
      avatar: "AM",
      role: "Frontend Engineer"
    },
    timestamp: "10 minutes ago",
    exactTime: "Oct 24, 2026 • 16:32 PM",
    starred: true,
    metadata: {
      ip: "192.168.1.104",
      device: "Chrome / macOS (Apple Silicon)",
      commitHash: "e4f8b92",
      branch: "feature/responsive-nav",
      changes: "+248 / -42 lines"
    },
    comments: [
      { id: 1, user: "Sarah Jenkins", text: "Great work on the mobile dropdown animations!", time: "5m ago" }
    ]
  },
  {
    id: "act-102",
    title: "Updated authentication API endpoint validation",
    description: "Resolved JWT token expiry edge case during concurrent session refresh requests.",
    project: "Authentication Module",
    category: "Code/Builds",
    type: "In Progress",
    user: {
      name: "Alex Morgan",
      avatar: "AM",
      role: "Frontend Engineer"
    },
    timestamp: "1 hour ago",
    exactTime: "Oct 24, 2026 • 15:15 PM",
    starred: false,
    metadata: {
      ip: "192.168.1.104",
      device: "VS Code / Extension Host",
      commitHash: "7a29c11",
      branch: "fix/jwt-expiry",
      changes: "+18 / -9 lines"
    },
    comments: []
  },
  {
    id: "act-103",
    title: "Sprint Planning & Dashboard UI Review",
    description: "Attended 45-minute sync with design and product teams. Finalized UI spec for Q4 workspace features.",
    project: "WorkSync Platform",
    category: "Meetings & Calls",
    type: "Completed",
    user: {
      name: "David Chen",
      avatar: "DC",
      role: "Product Manager"
    },
    timestamp: "3 hours ago",
    exactTime: "Oct 24, 2026 • 13:00 PM",
    starred: false,
    metadata: {
      location: "Google Meet",
      attendees: 6,
      duration: "45 mins"
    },
    comments: []
  },
  {
    id: "act-104",
    title: "Flagged high memory consumption on worker node 04",
    description: "Automated alert triggered: Memory utilization exceeded 88% threshold for > 15 minutes.",
    project: "Infrastructure",
    category: "System/Security",
    type: "Flagged/Alert",
    user: {
      name: "System Guard",
      avatar: "SG",
      role: "Automated Service"
    },
    timestamp: "5 hours ago",
    exactTime: "Oct 24, 2026 • 11:10 AM",
    starred: true,
    metadata: {
      ip: "10.0.42.12",
      server: "prod-us-east-worker-04",
      alertSeverity: "High"
    },
    comments: []
  },
  {
    id: "act-105",
    title: "Created task: Write API documentation for Webhooks v2",
    description: "Assigned to backend team with priority 'High' and due date set for Oct 28.",
    project: "Developer API",
    category: "Task Updates",
    type: "Created",
    user: {
      name: "Alex Morgan",
      avatar: "AM",
      role: "Frontend Engineer"
    },
    timestamp: "Yesterday",
    exactTime: "Oct 23, 2026 • 17:45 PM",
    starred: false,
    metadata: {
      taskId: "TASK-892",
      priority: "High"
    },
    comments: []
  },
  {
    id: "act-106",
    title: "Joined project: Employee Management Redesign",
    description: "Added to team permissions by Team Lead. Granted repository write privileges.",
    project: "Employee Management",
    category: "Team & Collaboration",
    type: "Created",
    user: {
      name: "Elena Rostova",
      avatar: "ER",
      role: "Design Lead"
    },
    timestamp: "Yesterday",
    exactTime: "Oct 23, 2026 • 14:20 PM",
    starred: false,
    metadata: {
      accessLevel: "Developer/Contributor"
    },
    comments: []
  }
];

export default function () {
  const [darkMode, setDarkMode] = useState(false);
  const [activities, setActivities] = useState(initialActivities);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [timeRange, setTimeRange] = useState("This Week");
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" | "table"

  // Modal / Drawer States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedDetailActivity, setSelectedDetailActivity] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // New Activity Form State
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    project: "WorkSync Platform",
    category: "Task Updates",
    type: "Completed"
  });

  // Filtered Activities Calculation
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesSearch =
        act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.user.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || act.category === selectedCategory;

      const matchesType =
        selectedType === "All" || act.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [activities, searchTerm, selectedCategory, selectedType]);

  // Quick Action Handlers
  const handleToggleStar = (id) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, starred: !a.starred } : a))
    );
  };

  const handleCopyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/activity#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.title.trim()) return;

    const created = {
      id: `act-${Date.now().toString().slice(-4)}`,
      title: newActivity.title,
      description: newActivity.description || "Manually logged workspace activity item.",
      project: newActivity.project,
      category: newActivity.category,
      type: newActivity.type,
      user: {
        name: "Alex Morgan",
        avatar: "AM",
        role: "Frontend Engineer"
      },
      timestamp: "Just now",
      exactTime: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      starred: false,
      metadata: {
        ip: "192.168.1.104",
        device: "Web Client",
        source: "Manual Log"
      },
      comments: []
    };

    setActivities([created, ...activities]);
    setNewActivity({
      title: "",
      description: "",
      project: "WorkSync Platform",
      category: "Task Updates",
      type: "Completed"
    });
    setIsLogModalOpen(false);
  };

  const handleExport = (format) => {
    const dataStr =
      format === "json"
        ? "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredActivities, null, 2))
        : "data:text/csv;charset=utf-8," +
          encodeURIComponent(
            "ID,Title,Project,Category,Type,Time\n" +
              filteredActivities
                .map((a) => `"${a.id}","${a.title}","${a.project}","${a.category}","${a.type}","${a.exactTime}"`)
                .join("\n")
          );

    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `worksync_activity_export.${format}`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper badge color lookup
  const getTypeBadge = (type) => {
    switch (type) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "In Progress":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "Created":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "Flagged/Alert":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Code/Builds":
        return <GitCommit className="h-4 w-4 text-purple-500" />;
      case "Task Updates":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "Meetings & Calls":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "System/Security":
        return <Shield className="h-4 w-4 text-rose-500" />;
      default:
        return <Activity className="h-4 w-4 text-teal-500" />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50/80 text-slate-900"}`}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">

        {/* Header Banner */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                <span>AUDIT & WORKFLOW TRACKER</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Activity & Audit Log
              </h1>
              <p className="mt-2 text-sm sm:text-base text-teal-100 max-w-2xl">
                Real-time tracking of code commits, task updates, meetings, and automated system alerts across all active projects.
              </p>
            </div>

            {/* Quick Header Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 p-3 text-white backdrop-blur-md transition hover:bg-white/20 border border-white/10"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-teal-100" />}
              </button>

              <button
                type="button"
                onClick={() => setIsLogModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-teal-950 shadow-lg transition hover:bg-teal-50 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Log Activity
              </button>

              <div className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl bg-teal-950/50 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md border border-white/20 transition hover:bg-teal-900/80"
                >
                  <Download className="h-4 w-4 text-teal-200" />
                  Export
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
                <div className="absolute right-0 top-full mt-2 hidden w-36 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 dark:bg-slate-900 dark:ring-white/10 group-hover:block z-20">
                  <button
                    onClick={() => handleExport("csv")}
                    className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport("json")}
                    className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Stat Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Logged</span>
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">{activities.length}</p>
            <p className="mt-1 text-xs text-teal-600 dark:text-teal-400 font-medium">+14% vs last week</p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Code Commits</span>
              <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <GitCommit className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
              {activities.filter((a) => a.category === "Code/Builds").length}
            </p>
            <p className="mt-1 text-xs text-purple-600 dark:text-purple-400 font-medium">Active repositories</p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">System Alerts</span>
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
              {activities.filter((a) => a.type === "Flagged/Alert").length}
            </p>
            <p className="mt-1 text-xs text-rose-500 font-medium">Requires review</p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starred Logs</span>
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Star className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
              {activities.filter((a) => a.starred).length}
            </p>
            <p className="mt-1 text-xs text-amber-600 font-medium">Pinned for audit</p>
          </div>
        </section>

        {/* Filter Controls Bar */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by action, project, user name, or metadata..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-teal-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-400 transition"
              />
            </div>

            {/* View Mode & Time Range */}
            <div className="flex items-center gap-3">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="All Time">All Time</option>
              </select>

              {/* View Switcher */}
              <div className="flex rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("timeline")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === "timeline"
                      ? "bg-white text-teal-800 shadow-sm dark:bg-slate-900 dark:text-teal-400"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    viewMode === "table"
                      ? "bg-white text-teal-800 shadow-sm dark:bg-slate-900 dark:text-teal-400"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/80">
            {["All", "Task Updates", "Code/Builds", "Meetings & Calls", "System/Security", "Team & Collaboration"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-teal-700 text-white shadow-sm dark:bg-teal-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}

            {/* Secondary Type Filter Pills */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Status:</span>
              {["All", "Completed", "In Progress", "Created", "Flagged/Alert"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition ${
                    selectedType === type
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Feed Content */}
        {filteredActivities.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <Info className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">No activity logs found</h3>
            <p className="mt-1 text-xs text-slate-500">Try loosening your search keywords or resetting category filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedType("All");
              }}
              className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "timeline" ? (
          /* Timeline View */
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {filteredActivities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Timeline Icon Node */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 shadow-sm dark:border-slate-950 dark:bg-slate-800">
                  {getCategoryIcon(act.category)}
                </div>

                {/* Activity Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-700 text-xs font-extrabold text-white shadow-sm">
                        {act.user.avatar}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {act.title}
                          </h3>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getTypeBadge(act.type)}`}>
                            {act.type}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                          {act.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="font-semibold text-teal-600 dark:text-teal-400">{act.project}</span>
                          <span>•</span>
                          <span>By {act.user.name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {act.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inline Quick Action Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => handleToggleStar(act.id)}
                        className={`rounded-xl p-2 transition ${
                          act.starred
                            ? "text-amber-500 bg-amber-50 dark:bg-amber-950/50"
                            : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        title="Star Activity"
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(act.id)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Copy direct link"
                      >
                        {copiedId === act.id ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDetailActivity(act)}
                        className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <Info className="h-3.5 w-3.5" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View Mode */
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Activity</th>
                    <th className="py-3.5 px-4 font-bold">Project</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">User</th>
                    <th className="py-3.5 px-4 font-bold">Time</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                        {act.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{act.project}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{act.category}</td>
                      <td className="py-3.5 px-4">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getTypeBadge(act.type)}`}>
                          {act.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{act.user.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{act.timestamp}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailActivity(act)}
                          className="font-bold text-teal-600 hover:underline dark:text-teal-400"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Log New Activity */}
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-teal-600" />
                  Log Manual Activity
                </h3>
                <button
                  onClick={() => setIsLogModalOpen(false)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddActivity} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Completed client sync meeting"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide brief details or context..."
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                    <select
                      value={newActivity.category}
                      onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="Task Updates">Task Updates</option>
                      <option value="Code/Builds">Code/Builds</option>
                      <option value="Meetings & Calls">Meetings & Calls</option>
                      <option value="System/Security">System/Security</option>
                      <option value="Team & Collaboration">Team & Collaboration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type / Status</label>
                    <select
                      value={newActivity.type}
                      onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Created">Created</option>
                      <option value="Flagged/Alert">Flagged/Alert</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800"
                  >
                    Save Activity
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Deep Audit Detail Drawer */}
        {selectedDetailActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
            <div className="h-full w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-teal-600" />
                  Audit Log Inspector
                </h3>
                <button
                  onClick={() => setSelectedDetailActivity(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Title</span>
                  <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedDetailActivity.title}
                  </h2>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Log Reference ID:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedDetailActivity.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Exact Timestamp:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{selectedDetailActivity.exactTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Project Workspace:</span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">{selectedDetailActivity.project}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Technical Metadata</h4>
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-2 text-xs font-mono">
                    {Object.entries(selectedDetailActivity.metadata || {}).map(([key, val]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <button
                    onClick={() => handleCopyLink(selectedDetailActivity.id)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => setSelectedDetailActivity(null)}
                    className="flex-1 rounded-xl bg-teal-700 py-2.5 text-xs font-bold text-white hover:bg-teal-800"
                  >
                    Close Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}