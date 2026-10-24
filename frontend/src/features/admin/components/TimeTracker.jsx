import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, History, Pause, Play, Square } from 'lucide-react';
import { dashboardTasks, sampleTimeSessions } from '../adminDashboardData';

const formatElapsed = (milliseconds) => {
  const totalMinutes = Math.floor(Math.max(0, milliseconds) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const formatDuration = (milliseconds) => {
  const totalMinutes = Math.floor(Math.max(0, milliseconds) / 60000);
  if (totalMinutes === 0) return '<1m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours ? `${hours}h ` : ''}${minutes}m`;
};

const formatToday = () =>
  new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date());

const TimeTracker = () => {
  const trackableTasks = useMemo(
    () => dashboardTasks.filter((task) => task.status !== 'Done'),
    []
  );
  const [taskId, setTaskId] = useState(trackableTasks[0]?.id ?? '');
  const [timerState, setTimerState] = useState('idle');
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [sessions, setSessions] = useState(sampleTimeSessions);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (timerState !== 'running' || startedAt === null) return undefined;

    const updateElapsed = () => {
      setElapsedMs((current) => current + Math.max(0, Date.now() - startedAt));
      setStartedAt(Date.now());
    };
    const timer = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, timerState]);

  const start = () => {
    if (timerState !== 'idle') return;
    setElapsedMs(0);
    setStartedAt(Date.now());
    setTimerState('running');
  };

  const pause = () => {
    if (timerState !== 'running' || startedAt === null) return;
    setElapsedMs((current) => current + Math.max(0, Date.now() - startedAt));
    setStartedAt(null);
    setTimerState('paused');
  };

  const resume = () => {
    if (timerState !== 'paused') return;
    setStartedAt(Date.now());
    setTimerState('running');
  };

  const stop = () => {
    if (timerState === 'idle') return;
    const finalElapsed = timerState === 'running' && startedAt !== null
      ? elapsedMs + Math.max(0, Date.now() - startedAt)
      : elapsedMs;
    const selectedTask = trackableTasks.find((task) => task.id === taskId);

    if (selectedTask && finalElapsed > 0) {
      setSessions((current) => [{
        id: `session-${Date.now()}`,
        title: selectedTask.title,
        durationMs: finalElapsed,
        date: 'Just now',
      }, ...current]);
    }

    setStartedAt(null);
    setElapsedMs(0);
    setTimerState('idle');
  };

  const selectedTask = trackableTasks.find((task) => task.id === taskId);
  const displayedElapsed = timerState === 'running' && startedAt !== null
    ? elapsedMs + Math.max(0, Date.now() - startedAt)
    : elapsedMs;

  return (
    <section aria-labelledby="time-tracker-title" className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#E2F5F3] text-[#278A8F]">
            <Clock3 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 id="time-tracker-title" className="text-base font-semibold text-slate-900">Time Tracker</h2>
            <p className="mt-0.5 text-xs text-slate-500">Track a focused work session</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory((current) => !current)}
          aria-expanded={showHistory}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#6542F5] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/30"
        >
          <History aria-hidden="true" className="size-3.5" />
          History
        </button>
      </div>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-xs font-medium text-slate-600">Project / task</span>
        <select
          aria-label="Select a task to track"
          value={taskId}
          onChange={(event) => setTaskId(event.target.value)}
          disabled={timerState !== 'idle'}
          className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15 disabled:bg-slate-50"
        >
          {trackableTasks.map((task) => (
            <option key={task.id} value={task.id}>{task.title}</option>
          ))}
        </select>
      </label>

      <div className="mt-5 rounded-2xl bg-[#F8F9FC] px-4 py-5 text-center">
        <p className="text-xs font-medium text-slate-500">{formatToday()}</p>
        <p aria-live="off" className="mt-2 font-mono text-4xl font-semibold tracking-wider text-slate-900">
          {formatElapsed(displayedElapsed)}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">{selectedTask?.title ?? 'Select a task'}</p>
        <p className="mt-2 text-[10px] text-slate-400">Session time is held in memory and resets when this page reloads.</p>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {timerState === 'idle' && (
          <button type="button" onClick={start} disabled={!taskId} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#6542F5] px-4 text-sm font-semibold text-white hover:bg-[#5635E0] disabled:opacity-50">
            <Play aria-hidden="true" className="size-4 fill-current" /> Start
          </button>
        )}
        {timerState === 'running' && (
          <button type="button" onClick={pause} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#F1EEFF] px-4 text-sm font-semibold text-[#6542F5] hover:bg-[#E9E3FF]">
            <Pause aria-hidden="true" className="size-4" /> Pause
          </button>
        )}
        {timerState === 'paused' && (
          <button type="button" onClick={resume} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#6542F5] px-4 text-sm font-semibold text-white hover:bg-[#5635E0]">
            <Play aria-hidden="true" className="size-4 fill-current" /> Resume
          </button>
        )}
        {timerState !== 'idle' && (
          <button type="button" onClick={stop} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#E6E7EC] bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Square aria-hidden="true" className="size-3.5 fill-current" /> Stop
          </button>
        )}
      </div>

      {showHistory && (
        <div className="mt-5 border-t border-[#EEF0F4] pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Previous tasks</h3>
          <ul className="mt-3 space-y-3">
            {sessions.length === 0 ? (
              <li className="text-sm text-slate-500">No recorded sessions yet.</li>
            ) : sessions.map((session) => (
              <li key={session.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{session.title}</p>
                  <p className="text-xs text-slate-400">{session.date}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-[#E2F5F3] px-2 py-1 text-xs font-semibold text-[#247A7F]">
                  {formatDuration(session.durationMs)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default TimeTracker;
