import React, { useState } from "react";
import {
  Search,
  CheckSquare,
  FolderGit2,
  Users,
  FileText,
  ArrowUpRight,
  Filter,
  X,
  Clock,
  Sparkles,
  Mail,
  ChevronRight,
} from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Mock global search database
  const searchResults = [
    {
      id: 1,
      type: "task",
      category: "tasks",
      title: "Complete employee dashboard UI",
      subtitle: "WorkSync Platform • Due Oct 30, 2026",
      badge: "High Priority",
      badgeColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
      icon: CheckSquare,
    },
    {
      id: 2,
      type: "task",
      category: "tasks",
      title: "Fix authentication validation",
      subtitle: "Auth Module • Due Nov 02, 2026",
      badge: "Medium Priority",
      badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
      icon: CheckSquare,
    },
    {
      id: 3,
      type: "project",
      category: "projects",
      title: "WorkSync Platform Core",
      subtitle: "75% completed • 8 active members",
      badge: "Active",
      badgeColor: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400",
      icon: FolderGit2,
    },
    {
      id: 4,
      type: "team",
      category: "team",
      title: "Sarah Jenkins",
      subtitle: "UI/UX Designer • Engineering Department",
      badge: "Online",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
      icon: Users,
    },
    {
      id: 5,
      type: "file",
      category: "files",
      title: "Dashboard_Wireframe_v2.pdf",
      subtitle: "Uploaded 2 days ago • 2.4 MB",
      badge: "PDF",
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
      icon: FileText,
    },
  ];

  const recentSearches = ["dashboard ui", "authentication", "Sarah Jenkins", "Figma tokens"];

  // Filter results
  const filteredResults = searchResults.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
          <Search size={13} /> GLOBAL DISCOVERY
        </div>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          Search Workspace
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Instantly find tasks, projects, team members, and documents across WorkSync.
        </p>
      </div>

      {/* Big Search Bar Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
        <input
          type="text"
          placeholder="Search by keyword, project name, or teammate..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-3xl border border-slate-200/80 bg-white py-4 pl-12 pr-12 text-base font-medium text-slate-800 shadow-sm outline-none focus:border-teal-500 focus:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Results" },
          { id: "tasks", label: "Tasks" },
          { id: "projects", label: "Projects" },
          { id: "team", label: "Team Members" },
          { id: "files", label: "Files & Docs" },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Recent Searches Suggestions (Shown when query is empty) */}
      {!query && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Clock size={15} /> Recent Searches
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-teal-950/40"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Search size={24} />
            </div>
            <h3 className="mt-4 font-bold text-slate-800 dark:text-slate-200">
              No matching results found
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Try checking your spelling or searching for a different keyword.
            </p>
          </div>
        ) : (
          filteredResults.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm transition-all hover:border-teal-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="rounded-2xl bg-teal-50 p-3 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 sm:border-t-0 sm:pt-0">
                  <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}