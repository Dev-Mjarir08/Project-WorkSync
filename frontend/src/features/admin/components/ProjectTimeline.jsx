import React, { useMemo, useState } from 'react';
import { CalendarClock, ClipboardCheck, Mail, Presentation, Users } from 'lucide-react';
import { timelineTasks } from '../adminDashboardData';

const windows = {
  day: { label: 'Full day', start: 7 * 60, end: 19 * 60 },
  morning: { label: 'Morning', start: 7 * 60, end: 12 * 60 },
  afternoon: { label: 'Afternoon', start: 12 * 60, end: 19 * 60 },
};

const axisTicks = [7 * 60, 9 * 60, 10 * 60, 12 * 60, 15 * 60, 17 * 60, 19 * 60];

const categoryStyles = {
  meeting: {
    bar: 'border-[#C6B8FF] bg-[#F1EEFF] text-[#5635D6]',
    icon: Users,
  },
  focus: {
    bar: 'border-[#BDE7E4] bg-[#E8F7F5] text-[#247A7F]',
    icon: Mail,
  },
  design: {
    bar: 'border-[#D8DDF8] bg-[#F0F2FC] text-[#5667A8]',
    icon: Presentation,
  },
};

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}${minutes % 60 ? `:${String(minutes % 60).padStart(2, '0')}` : ''} ${suffix}`;
};

const formatAxisTime = (minutes) => `${minutes / 60 % 12 || 12} ${minutes >= 12 * 60 ? 'PM' : 'AM'}`;

const ProjectTimeline = () => {
  const [timeWindow, setTimeWindow] = useState('day');
  const range = windows[timeWindow];
  const duration = range.end - range.start;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowPosition = ((nowMinutes - range.start) / duration) * 100;
  const isNowVisible = nowMinutes >= range.start && nowMinutes <= range.end;

  const ticks = useMemo(
    () => axisTicks.filter((tick) => tick >= range.start && tick <= range.end),
    [range]
  );
  const visibleTasks = useMemo(
    () => timelineTasks.filter((task) => toMinutes(task.end) > range.start && toMinutes(task.start) < range.end),
    [range]
  );

  return (
    <section aria-labelledby="project-timeline-title" className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
      <div className="flex flex-col gap-3 border-b border-[#EEF0F4] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#F1EEFF] text-[#6542F5]">
            <CalendarClock aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 id="project-timeline-title" className="text-base font-semibold text-slate-900">Project Timeline</h2>
            <p className="mt-0.5 text-xs text-slate-500">Today’s scheduled team work</p>
          </div>
        </div>
        <label className="flex items-center gap-2 self-start text-sm sm:self-auto">
          <span className="text-xs font-medium text-slate-500">View</span>
          <select
            aria-label="Timeline time range"
            value={timeWindow}
            onChange={(event) => setTimeWindow(event.target.value)}
            className="h-9 rounded-lg border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
          >
            {Object.entries(windows).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto p-4 sm:p-5">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[190px_minmax(0,1fr)]">
            <div className="flex items-center pb-2 text-xs font-medium text-slate-400">Team tasks</div>
            <div className="relative h-9 border-b border-[#EEF0F4]">
              {ticks.map((tick) => {
                const position = ((tick - range.start) / duration) * 100;
                return (
                  <span
                    key={tick}
                    className="absolute bottom-2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-slate-500"
                    style={{ left: `${position}%` }}
                  >
                    {formatAxisTime(tick)}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="relative">
            {visibleTasks.map((task) => {
              const taskStart = toMinutes(task.start);
              const taskEnd = toMinutes(task.end);
              const start = Math.max(taskStart, range.start);
              const end = Math.min(taskEnd, range.end);
              const left = ((start - range.start) / duration) * 100;
              const width = ((end - start) / duration) * 100;
              const style = categoryStyles[task.category] ?? categoryStyles.focus;
              const Icon = style.icon;

              return (
                <div key={task.id} className="grid grid-cols-[190px_minmax(0,1fr)] border-b border-[#F0F1F5] last:border-0">
                  <div className="flex min-h-14 items-center gap-2.5 pr-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-700">{task.title}</p>
                      <p className="text-[10px] text-slate-400">{formatTime(taskStart)}–{formatTime(taskEnd)}</p>
                    </div>
                  </div>
                  <div className="relative min-h-14">
                    {ticks.map((tick) => {
                      const position = ((tick - range.start) / duration) * 100;
                      return (
                        <span
                          key={tick}
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 border-l border-dashed border-[#E2E4EA]"
                          style={{ left: `${position}%` }}
                        />
                      );
                    })}
                    <div
                      title={`${task.title}: ${formatTime(taskStart)}–${formatTime(taskEnd)}`}
                      className={`absolute top-1/2 flex h-8 -translate-y-1/2 items-center overflow-hidden rounded-lg border px-2.5 text-[11px] font-semibold ${style.bar}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      <ClipboardCheck aria-hidden="true" className="mr-1.5 size-3.5 shrink-0" />
                      <span className="truncate">{task.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isNowVisible && (
              <div
                aria-label={`Current time ${formatTime(nowMinutes)}`}
                className="pointer-events-none absolute bottom-0 top-0 z-10 border-l-2 border-[#6542F5]"
                style={{ left: `calc(190px + (100% - 190px) * ${nowPosition / 100})` }}
              >
                <span className="absolute -left-[5px] top-0 size-2.5 rounded-full bg-[#6542F5] ring-2 ring-white" />
                <span className="absolute left-1 top-1 whitespace-nowrap rounded bg-white/90 px-1 text-[10px] font-semibold text-[#6542F5]">
                  Now
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#EEF0F4] px-4 py-3 text-xs text-slate-500 sm:px-5">
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-[#C6B8FF]" />Meetings</span>
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-[#BDE7E4]" />Focus time</span>
        <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-[#D8DDF8]" />Design work</span>
        {!isNowVisible && <span className="ml-auto text-slate-400">Current time is outside this view</span>}
      </div>
    </section>
  );
};

export default ProjectTimeline;
