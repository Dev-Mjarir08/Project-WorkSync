import React, { useState } from 'react';
import {
  Kanban,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const defaultColumns = [
  { id: 'todo', title: 'To Do', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700' },
  { id: 'in_progress', title: 'In Progress', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
  { id: 'review', title: 'In Review', dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700' },
  { id: 'done', title: 'Completed', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
];

export const KanbanBoard = ({
  tasks = [],
  onTaskMove = () => {},
  onTaskClick = () => {},
  onAddTask = () => {},
  readOnly = false
}) => {
  const [boardTasks, setBoardTasks] = useState(tasks);

  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'high' || p === 'urgent') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (p === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const advanceTask = (taskId, currentStatus) => {
    const statusMap = {
      todo: 'in_progress',
      in_progress: 'review',
      review: 'done'
    };
    const nextStatus = statusMap[currentStatus];
    if (!nextStatus) return;

    const updated = boardTasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t));
    setBoardTasks(updated);
    onTaskMove(taskId, nextStatus);
  };

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[750px]">
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
              className="flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 shadow-2xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                  <h3 className="text-xs font-bold text-slate-800">{col.title}</h3>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="mt-3 flex flex-col gap-3 min-h-[160px]">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="group rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getPriorityBadge(task.priority)}`}>
                          <span className="h-1 w-1 rounded-full bg-current" />
                          {task.priority || 'Normal'}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar size={11} />
                            {task.dueDate}
                          </span>
                        )}
                      </div>

                      <h4 className="mt-2 text-xs font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-[8px] font-bold text-white shrink-0">
                            {(task.assignee?.name || task.assignee || 'U').slice(0, 1).toUpperCase()}
                          </div>
                          <span className="truncate text-slate-600 font-medium">
                            {task.assignee?.name || task.assignee || 'Unassigned'}
                          </span>
                        </div>

                        {!readOnly && col.id !== 'done' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              advanceTask(task.id, col.id);
                            }}
                            className="rounded-md p-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition"
                            title="Move forward"
                          >
                            <ArrowRight size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-28 rounded-xl border border-dashed border-slate-200 text-center p-3 text-[11px] text-slate-400">
                    <span>No tasks</span>
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
