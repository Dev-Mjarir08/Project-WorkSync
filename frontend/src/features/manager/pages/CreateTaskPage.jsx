import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, AlertCircle } from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import managerService from "../managerService.js";

const statusValues = {
  "To Do": "todo",
  "In Progress": "in_progress",
  "In Review": "review",
  Completed: "done",
};

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assigneeId: "",
    priority: "High",
    status: "To Do",
    deadline: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;

    managerService.getProjects()
      .then((projectData) => {
        if (!active) return;
        setProjects(projectData);
        setFormData((current) => ({
          ...current,
          projectId: current.projectId || projectData[0]?.id || "",
        }));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load projects.");
      })
      .finally(() => {
        if (active) setLoadingProjects(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!formData.projectId) {
      setTeamMembers([]);
      setLoadingMembers(false);
      return () => {
        active = false;
      };
    }

    setError("");
    setLoadingMembers(true);
    managerService.getProjectMembers(formData.projectId)
      .then((members) => {
        if (!active) return;
        setTeamMembers(members);
        setFormData((current) => ({
          ...current,
          assigneeId: members.some((member) => member.id === current.assigneeId)
            ? current.assigneeId
            : "",
        }));
      })
      .catch((requestError) => {
        if (active) {
          setTeamMembers([]);
          setError(requestError.message || "Unable to load project members.");
        }
      })
      .finally(() => {
        if (active) setLoadingMembers(false);
      });

    return () => {
      active = false;
    };
  }, [formData.projectId]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = "Task title is required";
    }
    if (!formData.deadline) {
      errs.deadline = "Deadline is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setSubmitting(true);

    try {
      await managerService.createTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        ...(formData.projectId ? { projectId: formData.projectId } : {}),
        ...(formData.assigneeId ? { assigneeId: formData.assigneeId } : {}),
        priority: formData.priority.toLowerCase(),
        status: statusValues[formData.status],
        dueDate: formData.deadline,
      });
      navigate("/manager/tasks", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to create task.");
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
          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

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
                    Project
                  </label>
                  <div className="mt-1.5">
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value, assigneeId: "" })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                      disabled={loadingProjects}
                    >
                      <option value="">
                        {loadingProjects ? "Loading projects..." : "No project"}
                      </option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
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
                      value={formData.assigneeId}
                      onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                      disabled={!formData.projectId || loadingMembers}
                    >
                      <option value="">
                        {loadingMembers ? "Loading members..." : "Unassigned"}
                      </option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
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
                  Deadline <span className="text-rose-500">*</span>
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
                  disabled={submitting || loadingProjects || loadingMembers}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={15} />
                  <span>
                    {submitting
                      ? "Creating..."
                      : loadingProjects || loadingMembers
                        ? "Loading options..."
                        : "Create Task"}
                  </span>
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
