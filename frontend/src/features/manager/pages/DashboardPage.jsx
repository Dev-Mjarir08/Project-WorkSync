import React from "react";
import {
  ClipboardList,
  Clock3,
  CircleCheck,
  AlertCircle,
  Plus,
  Users,
  ArrowUpRight,
} from "lucide-react";

const summaryCards = [
  {
    title: "Total Tasks",
    value: 24,
    description: "Tasks across your projects",
    icon: ClipboardList,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "In Progress",
    value: 8,
    description: "Currently being worked on",
    icon: Clock3,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Completed",
    value: 12,
    description: "Tasks completed",
    icon: CircleCheck,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Overdue",
    value: 4,
    description: "Need your attention",
    icon: AlertCircle,
    color: "bg-rose-50 text-rose-600",
  },
];

const recentTasks = [
  {
    id: 1,
    title: "Design login page",
    project: "WorkSync Web App",
    assignee: "Ayan",
    priority: "High",
    status: "In Progress",
  },
  {
    id: 2,
    title: "Set up workspace",
    project: "WorkSync Web App",
    assignee: "Rouhan",
    priority: "Medium",
    status: "Completed",
  },
  {
    id: 3,
    title: "Review task assignments",
    project: "Team Management",
    assignee: "Devanshi",
    priority: "High",
    status: "Pending",
  },
  {
    id: 4,
    title: "Update project documentation",
    project: "Team Management",
    assignee: "Ayan",
    priority: "Low",
    status: "In Progress",
  },
];

const statusStyles = {
  "In Progress": "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
};

const priorityStyles = {
  High: "text-rose-600",
  Medium: "text-amber-600",
  Low: "text-slate-500",
};

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Manager Workspace
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, Devanshi!
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Here is an overview of your team and project progress.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Task
          </button>
        </header>

        {/* Summary Cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Project Overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick look at your task progress.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.title}
                      </p>
                      <p className="mt-3 text-3xl font-bold">{card.value}</p>
                    </div>

                    <div className={`rounded-lg p-3 ${card.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tasks Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent Tasks</h2>
              <p className="mt-1 text-sm text-slate-500">
                A snapshot of your team's latest work.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1 self-start text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              View all tasks
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Task</th>
                  <th className="px-5 py-4 font-medium">Assignee</th>
                  <th className="px-5 py-4 font-medium">Priority</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentTasks.map((task) => (
                  <tr key={task.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {task.project}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {task.assignee}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`font-medium ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status]}`}
                      >
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Team Overview */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <Users size={22} />
            </div>

            <div>
              <h2 className="font-semibold">Team Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage assignments and keep track of team progress.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { name: "Devanshi", role: "Manager", tasks: 8 },
              { name: "Ayan", role: "Admin", tasks: 6 },
              { name: "Rouhan", role: "Employee", tasks: 10 },
            ].map((member) => (
              <div
                key={member.name}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <p className="font-semibold">{member.name}</p>
                <p className="mt-1 text-xs text-slate-500">{member.role}</p>

                <p className="mt-4 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {member.tasks}
                  </span>{" "}
                  assigned tasks
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
