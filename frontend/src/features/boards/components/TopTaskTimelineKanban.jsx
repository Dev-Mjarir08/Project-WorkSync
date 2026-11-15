import React, { useState, useMemo } from 'react';
import {
  Kanban,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FolderKanban,
  Sparkles
} from 'lucide-react';
import KanbanBoard from './KanbanBoard.jsx';

const normalizeStatus = (value) => {
  const s = String(value || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (s.includes('done') || s.includes('complete')) return 'done';
  if (s.includes('progress')) return 'in_progress';
  if (s.includes('review')) return 'review';
  return 'todo';
};

export const TopTaskTimelineKanban = ({
  tasks = [],
  onTaskMove = () => {},
  onTaskDelete = null,
  onTaskClick = () => {},
  onAddTask = null,
  title = "Tasks & Kanban Delivery Timeline",
  subtitle = "Live delivery status across your team deliverables, active lanes, and project progress.",
  role = "manager",
  defaultExpanded = true
}) => {
  const [isKanbanExpanded, setIsKanbanExpanded] = useState(defaultExpanded);

  // Status Metrics Calculation
  const metrics = useMemo(() => {
    const total = tasks.length;
    let done = 0;
    let inProgress = 0;
    let review = 0;
    let todo = 0;

    tasks.forEach((t) => {
      const status = normalizeStatus(t.status);
      if (status === 'done') done++;
      else if (status === 'in_progress') inProgress++;
      else if (status === 'review') review++;
      else todo++;
    });

    const donePct = total > 0 ? Math.round((done / total) * 100) : 0;
    const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    const reviewPct = total > 0 ? Math.round((review / total) * 100) : 0;
    const todoPct = total > 0 ? Math.max(0, 100 - (donePct + inProgressPct + reviewPct)) : 0;

    return {
      total,
      done,
      inProgress,
      review,
      todo,
      donePct,
      inProgressPct,
      reviewPct,
      todoPct
    };
  }, [tasks]);

  return (
    <div className="space-y-4">
      {/* 1. TOP TIMELINE METRICS & PROGRESS BAR */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0d1322] p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Kanban className="h-4 w-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {metrics.donePct}% Complete
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            {onAddTask && (
              <button
                type="button"
                onClick={onAddTask}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsKanbanExpanded(!isKanbanExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              <span>{isKanbanExpanded ? "Hide Kanban" : "Show Kanban"}</span>
              {isKanbanExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Stat Cards Grid (Super Admin Style) */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Tasks */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/60 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Total Tasks</span>
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FolderKanban className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {metrics.total}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">100%</span>
            </div>
          </div>

          {/* Completed */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/60 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>Completed</span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {metrics.done}
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {metrics.donePct}%
              </span>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/60 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>In Progress</span>
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">
                {metrics.inProgress}
              </span>
              <span className="text-[11px] font-semibold text-blue-400">
                {metrics.inProgressPct}%
              </span>
            </div>
          </div>

          {/* Pending / To Do */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/60 border border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <span>To Do / Pending</span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                {metrics.todo + metrics.review}
              </span>
              <span className="text-[11px] font-semibold text-amber-400">
                {metrics.todoPct + metrics.reviewPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Horizontal Multi-Segment Timeline Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Sprint Delivery Lifecycle Timeline</span>
            <span>{metrics.done} of {metrics.total} deliverables finished</span>
          </div>

          <div className="h-3.5 w-full rounded-full bg-slate-900 border border-slate-800 p-0.5 flex overflow-hidden shadow-inner">
            {metrics.total === 0 ? (
              <div className="h-full w-full rounded-full bg-slate-800/50 flex items-center justify-center text-[9px] text-slate-500">
                No active tasks
              </div>
            ) : (
              <>
                {metrics.donePct > 0 && (
                  <div
                    style={{ width: `${metrics.donePct}%` }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-500"
                    title={`Completed: ${metrics.done} (${metrics.donePct}%)`}
                  />
                )}
                {metrics.inProgressPct > 0 && (
                  <div
                    style={{ width: `${metrics.inProgressPct}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                    title={`In Progress: ${metrics.inProgress} (${metrics.inProgressPct}%)`}
                  />
                )}
                {metrics.reviewPct > 0 && (
                  <div
                    style={{ width: `${metrics.reviewPct}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 transition-all duration-500"
                    title={`In Review: ${metrics.review} (${metrics.reviewPct}%)`}
                  />
                )}
                {metrics.todoPct > 0 && (
                  <div
                    style={{ width: `${metrics.todoPct}%` }}
                    className="h-full bg-slate-700 rounded-r-full transition-all duration-500"
                    title={`To Do: ${metrics.todo} (${metrics.todoPct}%)`}
                  />
                )}
              </>
            )}
          </div>

          {/* Timeline Breakdown Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Completed ({metrics.done})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span>In Progress ({metrics.inProgress})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              <span>In Review ({metrics.review})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              <span>To Do ({metrics.todo})</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP INTERACTIVE KANBAN BOARD (Collapsible) */}
      {isKanbanExpanded && (
        <div className="rounded-3xl border border-slate-800 bg-[#0d1322] p-5 sm:p-6 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white tracking-tight">Interactive Kanban Board</h3>
              <span className="text-xs text-slate-500">· Click 'Next' to advance status</span>
            </div>
          </div>

          <div className="mt-3">
            <KanbanBoard
              tasks={tasks}
              onTaskMove={onTaskMove}
              onTaskDelete={onTaskDelete}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              theme="dark"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TopTaskTimelineKanban;