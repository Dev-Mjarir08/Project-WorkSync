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
  title = "Tasks & Delivery Timeline",
  subtitle = "Live delivery status across your team deliverables, active lanes, and project progress.",
  role = "manager",
  defaultExpanded = true,
  theme = "light" // 'light' | 'dark'
}) => {
  const [isKanbanExpanded, setIsKanbanExpanded] = useState(defaultExpanded);
  const isLight = theme === 'light';

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
      <div
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all shadow-xs ${
          isLight
            ? 'border border-slate-200 bg-white shadow-slate-200/50'
            : 'border border-slate-800 bg-[#0d1322] shadow-2xl backdrop-blur-xl'
        }`}
      >
        {/* Section Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b ${
            isLight ? 'border-slate-100' : 'border-slate-800/80'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`p-2 rounded-xl ${
                  isLight
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}
              >
                <Kanban className="h-4 w-4" />
              </span>
              <h2
                className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {title}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {metrics.donePct}% Complete
              </span>
            </div>
            <p className={`mt-1 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            {onAddTask && (
              <button
                type="button"
                onClick={onAddTask}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                  isLight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsKanbanExpanded(!isKanbanExpanded)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span>{isKanbanExpanded ? "Hide Kanban" : "Show Kanban"}</span>
              {isKanbanExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Tasks */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight
                ? 'bg-slate-50/80 border-slate-200/80 text-slate-900'
                : 'bg-gradient-to-b from-slate-800/40 to-slate-900/60 border-slate-800/80'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>Total Tasks</span>
              <span
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}
              >
                <FolderKanban className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {metrics.total}
              </span>
              <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                100%
              </span>
            </div>
          </div>

          {/* Completed */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight
                ? 'bg-emerald-50/40 border-emerald-100 text-slate-900'
                : 'bg-gradient-to-b from-slate-800/40 to-slate-900/60 border-slate-800/80'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>Completed</span>
              <span
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  isLight ? 'text-emerald-600' : 'text-emerald-400'
                }`}
              >
                {metrics.done}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isLight
                    ? 'text-emerald-700 bg-emerald-100'
                    : 'text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {metrics.donePct}%
              </span>
            </div>
          </div>

          {/* In Progress */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight
                ? 'bg-blue-50/40 border-blue-100 text-slate-900'
                : 'bg-gradient-to-b from-slate-800/40 to-slate-900/60 border-slate-800/80'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>In Progress</span>
              <span
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  isLight ? 'text-blue-600' : 'text-blue-400'
                }`}
              >
                {metrics.inProgress}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  isLight ? 'text-blue-600' : 'text-blue-400'
                }`}
              >
                {metrics.inProgressPct}%
              </span>
            </div>
          </div>

          {/* Pending / To Do */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isLight
                ? 'bg-amber-50/40 border-amber-100 text-slate-900'
                : 'bg-gradient-to-b from-slate-800/40 to-slate-900/60 border-slate-800/80'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <span>To Do / Pending</span>
              <span
                className={`p-1.5 rounded-lg border ${
                  isLight
                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${
                  isLight ? 'text-amber-600' : 'text-amber-400'
                }`}
              >
                {metrics.todo + metrics.review}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  isLight ? 'text-amber-600' : 'text-amber-400'
                }`}
              >
                {metrics.todoPct + metrics.reviewPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Horizontal Multi-Segment Timeline Bar */}
        <div className="mt-5 space-y-2">
          <div
            className={`flex items-center justify-between text-xs ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Sprint Delivery Lifecycle Timeline
            </span>
            <span>
              {metrics.done} of {metrics.total} deliverables finished
            </span>
          </div>

          <div
            className={`h-3.5 w-full rounded-full p-0.5 flex overflow-hidden shadow-inner border ${
              isLight
                ? 'bg-slate-100 border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            {metrics.total === 0 ? (
              <div
                className={`h-full w-full rounded-full flex items-center justify-center text-[9px] ${
                  isLight ? 'bg-slate-200/50 text-slate-400' : 'bg-slate-800/50 text-slate-500'
                }`}
              >
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
                    className={`h-full rounded-r-full transition-all duration-500 ${
                      isLight ? 'bg-slate-300' : 'bg-slate-700'
                    }`}
                    title={`To Do: ${metrics.todo} (${metrics.todoPct}%)`}
                  />
                )}
              </>
            )}
          </div>

          {/* Timeline Breakdown Legend */}
          <div
            className={`flex flex-wrap items-center gap-3 pt-1 text-[11px] ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Completed ({metrics.done})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>In Progress ({metrics.inProgress})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span>In Review ({metrics.review})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>To Do ({metrics.todo})</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP INTERACTIVE KANBAN BOARD (Collapsible) */}
      {isKanbanExpanded && (
        <div
          className={`rounded-3xl p-5 sm:p-6 transition-all shadow-xs ${
            isLight
              ? 'border border-slate-200 bg-white'
              : 'border border-slate-800 bg-[#0d1322] shadow-2xl backdrop-blur-xl'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3
                className={`text-sm font-bold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Interactive Kanban Board
              </h3>
              <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                · Click 'Next' to advance status
              </span>
            </div>
          </div>

          <div className="mt-3">
            <KanbanBoard
              tasks={tasks}
              onTaskMove={onTaskMove}
              onTaskDelete={onTaskDelete}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              theme={theme}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TopTaskTimelineKanban;
