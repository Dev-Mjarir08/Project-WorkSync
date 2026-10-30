
import React, { useMemo, useState } from "react";
import {
  Search,
  Menu,
  ChevronRight,
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  CalendarDays,
  BriefcaseBusiness,
  TrendingUp,
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar.jsx";

// Frontend mock data
const employees = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@worksync.com",
    role: "Frontend Developer",
    tasks: [
      { id: 101, title: "Create dashboard UI", project: "WorkSync", priority: "High", status: "In Progress", dueDate: "2026-11-02" },
      { id: 102, title: "Implement responsive navbar", project: "WorkSync", priority: "Medium", status: "Pending", dueDate: "2026-11-04" },
      { id: 103, title: "Fix login page bugs", project: "Client Portal", priority: "High", status: "Pending", dueDate: "2026-11-05" },
      { id: 104, title: "Update profile page", project: "WorkSync", priority: "Low", status: "Completed", dueDate: "2026-10-25" },
    ],
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya@worksync.com",
    role: "UI/UX Designer",
    tasks: [
      { id: 201, title: "Design mobile screens", project: "Mobile App", priority: "High", status: "In Progress", dueDate: "2026-11-03" },
      { id: 202, title: "Prepare design system", project: "WorkSync", priority: "Medium", status: "Pending", dueDate: "2026-11-06" },
      { id: 203, title: "Review dashboard design", project: "WorkSync", priority: "Low", status: "Completed", dueDate: "2026-10-26" },
    ],
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit@worksync.com",
    role: "Backend Developer",
    tasks: [
      { id: 301, title: "Develop authentication API", project: "WorkSync", priority: "High", status: "Pending", dueDate: "2026-11-01" },
      { id: 302, title: "Database optimization", project: "Client Portal", priority: "High", status: "In Progress", dueDate: "2026-11-03" },
      { id: 303, title: "API documentation", project: "WorkSync", priority: "Medium", status: "Pending", dueDate: "2026-11-07" },
      { id: 304, title: "Fix API validation", project: "Client Portal", priority: "Medium", status: "Completed", dueDate: "2026-10-24" },
      { id: 305, title: "Update user endpoints", project: "WorkSync", priority: "Low", status: "Pending", dueDate: "2026-11-08" },
    ],
  },
  {
    id: 4,
    name: "Sneha Desai",
    email: "sneha@worksync.com",
    role: "QA Engineer",
    tasks: [
      { id: 401, title: "Test registration flow", project: "WorkSync", priority: "Medium", status: "Completed", dueDate: "2026-10-27" },
      { id: 402, title: "Test task management", project: "WorkSync", priority: "High", status: "Pending", dueDate: "2026-11-05" },
    ],
  },
  {
    id: 5,
    name: "Karan Mehta",
    email: "karan@worksync.com",
    role: "Frontend Developer",
    tasks: [
      { id: 501, title: "Build project overview", project: "Client Portal", priority: "High", status: "In Progress", dueDate: "2026-11-02" },
      { id: 502, title: "Improve table layout", project: "WorkSync", priority: "Low", status: "Completed", dueDate: "2026-10-28" },
      { id: 503, title: "Add notification UI", project: "WorkSync", priority: "Medium", status: "Pending", dueDate: "2026-11-06" },
    ],
  },
];

const getWorkload = (pending, inProgress) => {
  const activeTasks = pending + inProgress;

  if (activeTasks >= 4) return "High";
  if (activeTasks >= 2) return "Medium";
  return "Low";
};

const workloadStyles = {
  High: "bg-red-50 text-red-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-emerald-50 text-emerald-600",
};

const priorityStyles = {
  High: "bg-red-50 text-red-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-slate-100 text-slate-600",
};

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

const TeamWorkloadPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [workloadFilter, setWorkloadFilter] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const employeeStats = useMemo(() => {
    return employees.map((employee) => {
      const pending = employee.tasks.filter(
        (task) => task.status === "Pending"
      ).length;

      const inProgress = employee.tasks.filter(
        (task) => task.status === "In Progress"
      ).length;

      const completed = employee.tasks.filter(
        (task) => task.status === "Completed"
      ).length;

      const total = employee.tasks.length;

      return {
        ...employee,
        pending,
        inProgress,
        completed,
        total,
        workload: getWorkload(pending, inProgress),
        progress: total ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, []);

  const filteredEmployees = employeeStats.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase());

    const matchesWorkload =
      workloadFilter === "All" ||
      employee.workload === workloadFilter;

    return matchesSearch && matchesWorkload;
  });

  const totals = employeeStats.reduce(
    (acc, employee) => ({
      members: acc.members + 1,
      pending: acc.pending + employee.pending,
      inProgress: acc.inProgress + employee.inProgress,
      completed: acc.completed + employee.completed,
    }),
    { members: 0, pending: 0, inProgress: 0, completed: 0 }
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased">
      <Sidebar
        activeItem="workload"
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Home</span>
                <ChevronRight size={14} />
                <span className="text-blue-600 font-medium">
                  Team Workload
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-800 mt-1">
                Team Workload
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
            <Users size={17} />
            <span>Manager Overview</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Introduction */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Workload Overview
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Monitor your team's tasks and identify workload distribution.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryCard
              title="Team Members"
              value={totals.members}
              icon={<Users size={21} />}
              color="blue"
              subtitle="Total employees"
            />
            <SummaryCard
              title="Pending Tasks"
              value={totals.pending}
              icon={<ClipboardList size={21} />}
              color="amber"
              subtitle="Awaiting completion"
            />
            <SummaryCard
              title="In Progress"
              value={totals.inProgress}
              icon={<Clock size={21} />}
              color="indigo"
              subtitle="Currently being worked on"
            />
            <SummaryCard
              title="Completed Tasks"
              value={totals.completed}
              icon={<CheckCircle2 size={21} />}
              color="emerald"
              subtitle="Successfully completed"
            />
          </div>

          {/* Employee Workload */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Employee Workload
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Review assigned tasks and workload for each team member.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search employees..."
                      className="w-full sm:w-56 pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                  </div>

                  <select
                    value={workloadFilter}
                    onChange={(e) => setWorkloadFilter(e.target.value)}
                    className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-400"
                  >
                    <option value="All">All Workloads</option>
                    <option value="High">High Workload</option>
                    <option value="Medium">Medium Workload</option>
                    <option value="Low">Low Workload</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[850px]">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Employee</th>
                    <th className="px-4 py-4 font-semibold">Total Tasks</th>
                    <th className="px-4 py-4 font-semibold">Pending</th>
                    <th className="px-4 py-4 font-semibold">In Progress</th>
                    <th className="px-4 py-4 font-semibold">Completed</th>
                    <th className="px-4 py-4 font-semibold">Completion</th>
                    <th className="px-4 py-4 font-semibold">Workload</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {employee.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-800">
                              {employee.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {employee.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold">
                        {employee.total}
                      </td>
                      <td className="px-4 py-4 text-sm text-amber-600 font-medium">
                        {employee.pending}
                      </td>
                      <td className="px-4 py-4 text-sm text-blue-600 font-medium">
                        {employee.inProgress}
                      </td>
                      <td className="px-4 py-4 text-sm text-emerald-600 font-medium">
                        {employee.completed}
                      </td>

                      <td className="px-4 py-4">
                        <div className="w-28">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-semibold">
                              {employee.progress}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${employee.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${workloadStyles[employee.workload]}`}>
                          {employee.workload}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View Tasks
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-12">
                        <Users
                          size={30}
                          className="mx-auto text-slate-300 mb-2"
                        />
                        <p className="text-sm font-semibold text-slate-600">
                          No team members found
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try changing your search or workload filter.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 text-xs text-slate-500">
              Showing {filteredEmployees.length} of {employeeStats.length} team members
            </div>
          </section>

          {/* Workload Distribution */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={19} className="text-blue-600" />
              <div>
                <h2 className="font-bold text-slate-800">
                  Workload Distribution
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Active tasks assigned to each employee.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {employeeStats.map((employee) => {
                const active = employee.pending + employee.inProgress;
                const maxActive = Math.max(
                  1,
                  ...employeeStats.map((item) => item.pending + item.inProgress)
                );
                const width = (active / maxActive) * 100;

                return (
                  <div key={employee.id}>
                    <div className="flex justify-between items-center mb-2 gap-3">
                      <span className="text-sm font-medium text-slate-700">
                        {employee.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {active} active tasks
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* Employee Task Details Modal */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          onClick={() => setSelectedEmployee(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {selectedEmployee.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    {selectedEmployee.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedEmployee.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                aria-label="Close task details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[65vh]">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <DetailStat label="Pending" value={selectedEmployee.pending} />
                <DetailStat label="In Progress" value={selectedEmployee.inProgress} />
                <DetailStat label="Completed" value={selectedEmployee.completed} />
              </div>

              <h4 className="font-semibold text-sm text-slate-800 mb-3">
                Assigned Tasks
              </h4>

              <div className="space-y-3">
                {selectedEmployee.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-slate-200 rounded-xl p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm text-slate-800">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <BriefcaseBusiness size={13} />
                          {task.project}
                        </p>
                      </div>

                      <span className={`self-start px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[task.status]}`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-500">
                      <span className={`px-2 py-1 rounded-md font-semibold ${priorityStyles[task.priority]}`}>
                        {task.priority} Priority
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={13} />
                        Due: {task.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700"
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

// Reusable summary card
const SummaryCard = ({ title, value, icon, color, subtitle }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-3">{subtitle}</p>
    </div>
  );
};

const DetailStat = ({ label, value }) => (
  <div className="bg-slate-50 rounded-xl p-3 text-center">
    <p className="text-xl font-bold text-slate-800">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{label}</p>
  </div>
);

export default TeamWorkloadPage;
