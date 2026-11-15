import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  Trash2,
  User
} from 'lucide-react';

const defaultColumns = [
  { id: 'todo', title: 'To Do', dot: 'bg-slate-400', badge: 'bg-slate-500/15 text-slate-300 border-slate-700/50' },
  { id: 'in_progress', title: 'In Progress', dot: 'bg-blue-500', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { id: 'review', title: 'In Review', dot: 'bg-purple-500', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { id: 'done', title: 'Completed', dot: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
];

export const KanbanBoard = ({
  tasks = [],
  onTaskMove = () => {},
  onTaskClick = () => {},
  onTaskDelete = null,
  onAddTask = null,
  readOnly = false,
  theme = 'dark' // 'dark' | 'light'
}) => {
  const [boardTasks, setBoardTasks] = useState(tasks);

  // Sync boardTasks whenever parent tasks update (prevents deleted tasks from remaining visible)
  useEffect(() => {
    setBoardTasks(tasks || []);
  }, [tasks]);

  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'high' || p === 'urgent') return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    if (p === 'medium') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const advanceTask = (taskId, currentStatus) => {
    const statusMap = {
      todo: 'in_progress',
      in_progress: 'review',
      review: 'done'
    };
    const nextStatus = statusMap[currentStatus];
    if (!nextStatus) return;

    const updated = boardTasks.map((t) => ((t.id === taskId || t._id === taskId) ? { ...t, status: nextStatus } : t));
    setBoardTasks(updated);
    onTaskMove(taskId, nextStatus);
  };

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[760px]">
        {defaultColumns.map((col) => {
          const colTasks = boardTasks.filter((t) => {
            const s = (t.status || '').toLowerCase().replace(/[\s-]/g, '_');
            if (col.id === 'todo') return s === 'todo' || s === 'pending';
            if (col.id === 'in_progress') return s === 'in_progress' || s === 'inprogress';
            if (col.id === 'review') return s === 'review' || s === 'in_review';
            if (col.id === 'done') return s === 'done' || s === 'completed';
            return false;
          });

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-xl backdrop-blur-md"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot} shadow-xs`} />
                  <h3 className="text-xs font-bold text-slate-200 tracking-tight">{col.title}</h3>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="mt-3.5 flex flex-col gap-3 min-h-[160px]">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => {
                    const taskId = task.id || task._id;
                    const assigneeName = task.assignee?.name || task.assigneeName || (typeof task.assignee === 'string' ? task.assignee : 'Unassigned');
                    const initial = (assigneeName || 'U').slice(0, 1).toUpperCase();

                    return (
                      <div
                        key={taskId}
                        onClick={() => onTaskClick(task)}
                        className="group relative rounded-xl border border-slate-800 bg-[#0f172a] hover:bg-[#131d35] p-3.5 shadow-md hover:border-slate-700 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getPriorityBadge(task.priority)}`}>
                            <span className="h-1 w-1 rounded-full bg-current" />
                            {task.priority || 'Normal'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {task.dueDate && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Calendar size={11} />
                                {typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}

                            {onTaskDelete && !readOnly && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTaskDelete(taskId, task.title);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                                title="Delete task"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="mt-2 text-xs font-bold text-white group-hover:text-indigo-300 leading-snug transition-colors line-clamp-2">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-[8px] font-bold text-white shrink-0 shadow-xs">
                              {initial}
                            </div>
                            <span className="truncate text-slate-300 font-medium">
                              {assigneeName}
                            </span>
                          </div>

                          {!readOnly && col.id !== 'done' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                advanceTask(taskId, col.id);
                              }}
                              className="rounded-lg px-2 py-1 bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60 transition flex items-center gap-1 text-[10px] font-medium"
                              title="Advance to next column"
                            >
                              <span>Next</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-slate-800/80 text-center p-3 text-[11px] text-slate-500">
                    <span>No tasks in this lane</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;