import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, AlertCircle } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import { managerService } from "../managerService.js";
import { getUserItem, setUserItem } from "../../../utils/userStorage.js";

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectsList, setProjectsList] = useState(() => getUserItem("manager_projects", []));
  const [teamMembersList, setTeamMembersList] = useState(() => getUserItem("manager_team", []));

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assignee: "",
    priority: "Medium",
    status: "To Do",
    deadline: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      managerService.getProjects().catch(() => []),
      managerService.getTeamMembers().catch(() => [])
    ]).then(([projs, members]) => {
      if (!active) return;
      if (Array.isArray(projs) && projs.length > 0) {
        setProjectsList(projs);
        setUserItem("manager_projects", projs);
        setFormData((prev) => ({
          ...prev,
          projectId: prev.projectId || projs[0]?.id || projs[0]?._id || ""
        }));
      }
      if (Array.isArray(members) && members.length > 0) {
        setTeamMembersList(members);
        setUserItem("manager_team", members);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = "Task title is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const selectedProj = projectsList.find(p => (p.id === formData.projectId || p._id === formData.projectId));
      const projName = selectedProj?.name || "General Initiative";

      await managerService.createTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectId: formData.projectId || undefined,
        project: projName,
        assignee: formData.assignee || "Unassigned",
        priority: formData.priority.toLowerCase(),
        status: (formData.status || "To Do").toLowerCase().replace(/[\s-]+/g, "_"),
        dueDate: formData.deadline || null
      });

      navigate("/manager/tasks");
    } catch (err) {
      console.error("Create task error:", err);
      navigate("/manager/tasks");
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: "Tasks", href: "/manager/tasks" },
    { label: "Create Task" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar activeItem="tasks" mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Consistent Top Header */}
        <Header setMobileOpen={setMobileMenuOpen} breadcrumbs={breadcrumbs} />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl w-full mx-auto">
          {/* Back Navigation & Intro */}
          <div>
            <Link
              to="/manager/tasks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-3"
            >
              <ArrowLeft size={14} />
              <span>Back to Tasks</span>
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Create Task
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Fill in the deliverable details to assign a task to your team.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Implement WebSocket reconnection and state recovery"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (errors.title) setErrors({ ...errors, title: null });
                    }}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                      errors.title
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                </div>
                {errors.title && (
                  <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Task Description
                  </label>
                  <span className="text-[11px] text-slate-400">Detailed requirements</span>
                </div>
                <div className="mt-1.5">
                  <textarea
                    rows={4}
                    placeholder="Describe the task requirements, technical context, and acceptance criteria..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition resize-y"
                  />
                </div>
              </div>

              {/* Project & Assignee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Project Initiative
                  </label>
                  <div className="mt-1.5">
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                    >
                      <option value="">Select Project</option>
                      {projectsList.map((p) => (
                        <option key={p.id || p._id} value={p.id || p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Assignee
                  </label>
                  <div className="mt-1.5">
                    <select
                      value={formData.assignee}
                      onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {teamMembersList.map((m) => (
                        <option key={m.id || m._id || m.name} value={m.name}>
                          {m.name} {m.role ? `(${m.role})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Priority
                  </label>
                  <div className="mt-1.5">
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Status
                  </label>
                  <div className="mt-1.5">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Deadline
                </label>
                <div className="mt-1.5">
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => {
                      setFormData({ ...formData, deadline: e.target.value });
                      if (errors.deadline) setErrors({ ...errors, deadline: null });
                    }}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 transition cursor-pointer ${
                      errors.deadline
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                </div>
                {errors.deadline && (
                  <p className="mt-1 text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{errors.deadline}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Link
                  to="/manager/tasks"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  <Plus size={15} />
                  <span>{submitting ? "Creating..." : "Create Task"}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateTaskPage;
