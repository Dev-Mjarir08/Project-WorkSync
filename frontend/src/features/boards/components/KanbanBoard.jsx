import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Plus,
  Trash2,
  Calendar,
  ArrowRight,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useConfirm } from '../../../context/ConfirmContext.jsx';

const defaultColumns = [
  { id: 'todo', title: 'To Do', dot: 'bg-slate-400', badgeDark: 'bg-slate-800 text-slate-300 border-slate-700', badgeLight: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'in_progress', title: 'In Progress', dot: 'bg-blue-500', badgeDark: 'bg-blue-500/15 text-blue-300 border-blue-500/30', badgeLight: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'review', title: 'In Review', dot: 'bg-purple-500', badgeDark: 'bg-purple-500/15 text-purple-300 border-purple-500/30', badgeLight: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'done', title: 'Completed', dot: 'bg-emerald-500', badgeDark: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', badgeLight: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

export const KanbanBoard = ({
  tasks = [],
  onTaskMove = () => {},
  onTaskClick = () => {},
  onTaskDelete = null,
  onAddTask = null,
  readOnly = false,
  theme = 'light' // 'dark' | 'light'
}) => {
  const confirm = useConfirm();
  const [boardTasks, setBoardTasks] = useState(tasks);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);

  // Sync boardTasks whenever parent tasks update (prevents deleted tasks from remaining visible)
  useEffect(() => {
    setBoardTasks(tasks || []);
  }, [tasks]);

  const isLight = theme === 'light';

  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    if (isLight) {
      if (p === 'high' || p === 'urgent') return 'bg-rose-50 text-rose-700 border-rose-200';
      if (p === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    if (p === 'high' || p === 'urgent') return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    if (p === 'medium') return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const normalizeLaneStatus = (s) => {
    const v = String(s || '').toLowerCase().replace(/[\s-]/g, '_');
    if (v === 'done' || v === 'completed') return 'done';
    if (v === 'in_progress' || v === 'inprogress') return 'in_progress';
    if (v === 'review' || v === 'in_review') return 'review';
    return 'todo';
  };

  const handleTaskStatusChange = async (taskId, targetColumnId) => {
    const currentTask = boardTasks.find((t) => (t.id === taskId || t._id === taskId));
    if (!currentTask) return;
    if (normalizeLaneStatus(currentTask.status) === targetColumnId) return;

    // Once completed/done, task is locked and cannot be moved or edited
    if (normalizeLaneStatus(currentTask.status) === 'done') {
      return;
    }

    // Moving to done/completed requires user confirmation
    if (targetColumnId === 'done') {
      const isConfirmed = await confirm({
        title: 'Complete Task',
        message: 'Is this task completed? Once completed, this task will be locked and cannot be edited.',
        confirmText: 'Yes, Complete',
        cancelText: 'Cancel'
      });
      if (!isConfirmed) return;
    }

    const updated = boardTasks.map((t) =>
      (t.id === taskId || t._id === taskId) ? { ...t, status: targetColumnId } : t
    );
    setBoardTasks(updated);
    onTaskMove(taskId, targetColumnId);
  };

  const advanceTask = async (taskId, currentStatus) => {
    const statusMap = {
      todo: 'in_progress',
      in_progress: 'review',
      review: 'done'
    };
    const nextStatus = statusMap[currentStatus];
    if (!nextStatus) return;
    await handleTaskStatusChange(taskId, nextStatus);
  };

  // HTML5 Drag Handlers
  const handleDragStart = (e, taskId) => {
    if (readOnly) return;
    const currentTask = boardTasks.find((t) => (t.id === taskId || t._id === taskId));
    if (currentTask && normalizeLaneStatus(currentTask.status) === 'done') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', String(taskId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleDragOverColumn = (e, columnId) => {
    if (readOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeaveColumn = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverColumnId(null);
  };

  const handleDropOnColumn = (e, columnId) => {
    if (readOnly) return;
    e.preventDefault();
    setDragOverColumnId(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);
    if (taskId) {
      handleTaskStatusChange(taskId, columnId);
    }
  };

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[760px]">
        {defaultColumns.map((col) => {
          const colTasks = boardTasks.filter((t) => normalizeLaneStatus(t.status) === col.id);
          const isDragTarget = dragOverColumnId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOverColumn(e, col.id)}
              onDragLeave={handleDragLeaveColumn}
              onDrop={(e) => handleDropOnColumn(e, col.id)}
              className={`flex flex-col rounded-2xl p-4 transition-all duration-200 shadow-xs ${
                isDragTarget
                  ? isLight
                    ? 'border-2 border-dashed border-blue-500 bg-blue-50/80 shadow-md ring-2 ring-blue-400/20 scale-[1.01]'
                    : 'border-2 border-dashed border-indigo-400 bg-indigo-950/40 shadow-xl ring-2 ring-indigo-500/20 scale-[1.01]'
                  : isLight
                  ? 'border border-slate-200/90 bg-slate-100/70 hover:border-slate-300'
                  : 'border border-slate-800/80 bg-slate-900/60 shadow-xl backdrop-blur-md'
              }`}
            >
              {/* Column Header */}
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot} shadow-xs`} />
                  <h3
                    className={`text-xs font-bold tracking-tight ${
                      isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}
                  >
                    {col.title}
                  </h3>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                    isLight ? col.badgeLight : col.badgeDark
                  }`}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="mt-3.5 flex flex-col gap-3 min-h-[160px]">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => {
                    const taskId = task.id || task._id;
                    const isDragging = draggedTaskId === taskId;
                    const isDone = normalizeLaneStatus(task.status) === 'done';
                    const assigneeName =
                      task.assignee?.name ||
                      task.assigneeName ||
                      (typeof task.assignee === 'string' ? task.assignee : 'Unassigned');
                    const initial = (assigneeName || 'U').slice(0, 1).toUpperCase();

                    return (
                      <div
                        key={taskId}
                        draggable={!readOnly && !isDone}
                        onDragStart={(e) => handleDragStart(e, taskId)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onTaskClick(task)}
                        className={`group relative rounded-xl p-3.5 transition-all select-none border ${
                          !readOnly && !isDone
                            ? 'cursor-grab active:cursor-grabbing'
                            : 'cursor-pointer'
                        } ${
                          isDragging
                            ? 'opacity-40 scale-95 border-dashed border-blue-500 shadow-xl bg-blue-50/50'
                            : isDone
                            ? isLight
                              ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
                              : 'bg-emerald-950/20 border-emerald-800/40 shadow-xs'
                            : isLight
                            ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs hover:shadow-md'
                            : 'bg-[#0f172a] hover:bg-[#131d35] border-slate-800 hover:border-slate-700 shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getPriorityBadge(
                                task.priority
                              )}`}
                            >
                              <span className="h-1 w-1 rounded-full bg-current" />
                              {task.priority || 'Normal'}
                            </span>
                            {isDone && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100/80 px-2 py-0.5 text-[9px] font-bold text-emerald-800 shadow-2xs">
                                <CheckCircle2 size={10} />
                                Completed & Locked
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {task.dueDate && (
                              <span
                                className={`text-[10px] flex items-center gap-1 ${
                                  isLight ? 'text-slate-500' : 'text-slate-400'
                                }`}
                              >
                                <Calendar size={11} />
                                {typeof task.dueDate === 'string'
                                  ? task.dueDate.split('T')[0]
                                  : new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}

                            {onTaskDelete && !readOnly && !isDone && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onTaskDelete(taskId, task.title);
                                }}
                                className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition cursor-pointer ${
                                  isLight
                                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                    : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                                }`}
                                title="Delete task"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4
                          className={`mt-2 text-xs font-bold leading-snug transition-colors line-clamp-2 ${
                            isDone
                              ? isLight
                                ? 'text-slate-600 line-through'
                                : 'text-slate-400 line-through'
                              : isLight
                              ? 'text-slate-900 group-hover:text-blue-600'
                              : 'text-white group-hover:text-indigo-300'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {task.description && (
                          <p
                            className={`mt-1 line-clamp-2 text-[11px] ${
                              isLight ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            {task.description}
                          </p>
                        )}

                        <div
                          className={`mt-3 flex items-center justify-between pt-2 border-t text-[10px] ${
                            isLight ? 'border-slate-100' : 'border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-[8px] font-bold text-white shrink-0 shadow-xs">
                              {initial}
                            </div>
                            <span
                              className={`truncate font-medium ${
                                isLight ? 'text-slate-700' : 'text-slate-300'
                              }`}
                            >
                              {assigneeName}
                            </span>
                          </div>

                          {isDone ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <Lock size={10} />
                              <span>Locked</span>
                            </span>
                          ) : (!readOnly && col.id !== 'done' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                advanceTask(taskId, col.id);
                              }}
                              className={`rounded-lg px-2 py-1 transition flex items-center gap-1 text-[10px] font-medium cursor-pointer ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200'
                                  : 'bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700/60'
                              }`}
                              title="Advance to next column"
                            >
                              <span>Next</span>
                              <ArrowRight size={10} />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className={`flex flex-col items-center justify-center h-28 rounded-xl border border-dashed text-center p-3 text-[11px] transition-colors ${
                      isDragTarget
                        ? isLight
                          ? 'border-blue-400 bg-blue-100/50 text-blue-700 font-medium'
                          : 'border-indigo-400 bg-indigo-900/30 text-indigo-300'
                        : isLight
                        ? 'border-slate-200 bg-white/50 text-slate-400'
                        : 'border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <span>{isDragTarget ? 'Drop task here' : 'No tasks in this lane'}</span>
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
