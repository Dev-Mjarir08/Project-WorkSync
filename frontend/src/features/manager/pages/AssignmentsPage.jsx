
import React, { useMemo, useState } from "react";
import {
  Search,
  Menu,
  ChevronRight,
  ClipboardList,
  Users,
  UserX,
  X,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";

const initialAssignments = [
  {
    id: 1,
    title: "Design dashboard UI",
    project: "WorkSync Web App",
    assignee: "Aarav Patel",
    status: "In Progress",
    priority: "High",
    deadline: "2026-11-05",
  },
  {
    id: 2,
    title: "Implement login validation",
    project: "WorkSync Web App",
    assignee: "Priya Shah",
    status: "To Do",
    priority: "Medium",
    deadline: "2026-11-08",
  },
  {
    id: 3,
    title: "Test notification flow",
    project: "Notifications",
    assignee: "Unassigned",
    status: "To Do",
    priority: "Low",
    deadline: "2026-11-12",
  },
  {
    id: 4,
    title: "Optimize API response time",
    project: "Real-Time Sync Engine",
    assignee: "Rohan Mehta",
    status: "In Review",
    priority: "High",
    deadline: "2026-11-15",
  },
  {
    id: 5,
    title: "Prepare analytics dashboard",
    project: "Analytics & Reporting Hub",
    assignee: "Neha Desai",
    status: "Completed",
    priority: "Medium",
    deadline: "2026-10-25",
  },
];

const employees = [
  "Aarav Patel",
  "Priya Shah",
  "Rohan Mehta",
  "Neha Desai",
];

const statusStyles = {
  "To Do": "bg-slate-100 text-slate-700 border-slate-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  "In Review": "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityStyles = {
  High: "bg-rose-50 text-rose-700",
  Medium: "bg-amber-50 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const counts = useMemo(
    () => ({
      All: assignments.length,
      "To Do": assignments.filter((task) => task.status === "To Do").length,
      "In Progress": assignments.filter(
        (task) => task.status === "In Progress"
      ).length,
      "In Review": assignments.filter(
        (task) => task.status === "In Review"
      ).length,
      Completed: assignments.filter(
        (task) => task.status === "Completed"
      ).length,
    }),
    [assignments]
  );

  const assignedCount = assignments.filter(
    (task) => task.assignee !== "Unassigned"
  ).length;

  const filteredAssignments = useMemo(() => {
    return assignments.filter((task) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.project.toLowerCase().includes(query) ||
        task.assignee.toLowerCase().includes(query);

      const matchesEmployee =
        employeeFilter === "All" || task.assignee === employeeFilter;

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      return matchesSearch && matchesEmployee && matchesStatus;
    });
  }, [assignments, search, employeeFilter, statusFilter]);

  function openAssignment(task) {
    setEditingTask(task);
    setSelectedEmployee(
      task.assignee === "Unassigned" ? "" : task.assignee
    );
  }

  function saveAssignment() {
    if (!editingTask || !selectedEmployee) return;

    setAssignments((current) =>
      current.map((task) =>
        task.id === editingTask.id
          ? { ...task, assignee: selectedEmployee }
          : task
      )
    );

    setEditingTask(null);
    setSelectedEmployee("");
  }

  function resetFilters() {
    setSearch("");
    setEmployeeFilter("All");
    setStatusFilter("All");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      <Sidebar
        activeItem="assignments"
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open mobile navigation menu"
            >
              <Menu size={18} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">WorkSync</span>
              <ChevronRight size={13} className="text-slate-400" />
              <span>Manager</span>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="font-medium text-blue-600">
                Assignments
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Task Assignments
              </h1>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                {assignments.length}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Assign tasks to employees and monitor ownership and progress.
            </p>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              icon={<ClipboardList size={19} />}
              label="Total Tasks"
              value={assignments.length}
            />
            <SummaryCard
              icon={<Users size={19} />}
              label="Assigned Tasks"
              value={assignedCount}
            />
            <SummaryCard
              icon={<UserX size={19} />}
              label="Unassigned Tasks"
              value={assignments.length - assignedCount}
            />
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "To Do", "In Progress", "In Review", "Completed"].map(
                (status) => {
                  const active = statusFilter === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {status}
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                        {counts[status]}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks, projects or employees..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-8 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <select
                value={employeeFilter}
                onChange={(event) => setEmployeeFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All employees</option>
                <option value="Unassigned">Unassigned</option>
                {employees.map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  All Assignments
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review task ownership and reassign work when needed.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {filteredAssignments.length} results
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Task</th>
                    <th className="px-5 py-4 font-semibold">Assignee</th>
                    <th className="px-5 py-4 font-semibold">Priority</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Deadline</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAssignments.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {task.project}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {task.assignee}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            priorityStyles[task.priority] || priorityStyles.Low
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            statusStyles[task.status] || statusStyles["To Do"]
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        {new Date(`${task.deadline}T12:00:00`).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openAssignment(task)}
                          className="font-semibold text-xs text-blue-600 hover:text-blue-800"
                        >
                          {task.assignee === "Unassigned" ? "Assign" : "Reassign"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredAssignments.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-xs text-slate-500"
                      >
                        No assignments match your filters.
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="ml-2 font-semibold text-blue-600 hover:text-blue-800"
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

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-modal-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h2
              id="assignment-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              {editingTask.assignee === "Unassigned"
                ? "Assign Task"
                : "Reassign Task"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {editingTask.title}
            </p>

            <label className="mt-5 block text-xs font-semibold text-slate-700">
              Select employee
            </label>
            <select
              autoFocus
              value={selectedEmployee}
              onChange={(event) => setSelectedEmployee(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Choose an employee</option>
              {employees.map((employee) => (
                <option key={employee} value={employee}>
                  {employee}
                </option>
              ))}
            </select>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAssignment}
                disabled={!selectedEmployee}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
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
