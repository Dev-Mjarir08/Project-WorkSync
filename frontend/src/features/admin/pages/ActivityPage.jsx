import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CirclePlus,
  Clock3,
  MessageCircle,
  Search,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../adminService';

const activityTypes = {
  task_completed: { label: 'Task completed', icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
  task_updated: { label: 'Task updated', icon: Activity, tone: 'bg-violet-50 text-violet-700' },
  task_created: { label: 'Task created', icon: CirclePlus, tone: 'bg-sky-50 text-sky-700' },
  comment_added: { label: 'Comment added', icon: MessageCircle, tone: 'bg-orange-50 text-orange-700' },
  member_added: { label: 'Member joined', icon: Users, tone: 'bg-teal-50 text-teal-700' },
  board_updated: { label: 'Board updated', icon: Activity, tone: 'bg-indigo-50 text-indigo-700' },
};

const formatDateTime = (value) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [boardFilter, setBoardFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    try {
      setActivities(adminService.getActivities());
      setBoards(adminService.getBoards());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Activity could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const boardById = useMemo(
    () => new Map(boards.map((board) => [board.id, board])),
    [boards]
  );
  const actors = useMemo(
    () => [...new Map(activities.map((item) => [item.actor.id, item.actor])).values()],
    [activities]
  );
  const filteredActivities = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return activities
      .filter((item) => {
        const board = boardById.get(item.boardId);
        const haystack = [
          item.actor.name,
          item.detail,
          item.task,
          board?.title,
          activityTypes[item.type]?.label,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase();

        return (
          (!query || haystack.includes(query)) &&
          (typeFilter === 'all' || item.type === typeFilter) &&
          (actorFilter === 'all' || item.actor.id === actorFilter) &&
          (boardFilter === 'all' || item.boardId === boardFilter) &&
          (!dateFrom || item.date.slice(0, 10) >= dateFrom) &&
          (!dateTo || item.date.slice(0, 10) <= dateTo)
        );
      })
      .sort((first, second) => new Date(second.date) - new Date(first.date));
  }, [activities, actorFilter, boardById, boardFilter, dateFrom, dateTo, search, typeFilter]);

  const contributorsCount = new Set(activities.map((item) => item.actor.id)).size;
  const touchedBoardsCount = new Set(activities.map((item) => item.boardId)).size;

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setActorFilter('all');
    setBoardFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-[#6542F5]">Workspace overview</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Activity</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Follow the latest updates and see what your team has been working on.
        </p>
      </div>

      <section aria-label="Activity summary" className="grid gap-4 sm:grid-cols-3">
        <SummaryCard icon={Activity} label="Recorded updates" value={activities.length} tone="bg-[#F1EEFF] text-[#6542F5]" />
        <SummaryCard icon={Users} label="Contributors" value={contributorsCount} tone="bg-[#E2F5F3] text-[#278A8F]" />
        <SummaryCard icon={ArrowUpRight} label="Boards touched" value={touchedBoardsCount} tone="bg-[#EAF2FF] text-[#3971C6]" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/40">
        <div className="border-b border-[#E6E7EC] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-500">A chronological view of work across your boards.</p>
            </div>
            <label className="relative block w-full xl:max-w-xs">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search activity"
                aria-label="Search activity"
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <FilterSelect label="Activity type" value={typeFilter} onChange={setTypeFilter}>
              <option value="all">All activity</option>
              {Object.entries(activityTypes).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </FilterSelect>
            <FilterSelect label="Person" value={actorFilter} onChange={setActorFilter}>
              <option value="all">All people</option>
              {actors.map((actor) => <option key={actor.id} value={actor.id}>{actor.name}</option>)}
            </FilterSelect>
            <FilterSelect label="Board" value={boardFilter} onChange={setBoardFilter}>
              <option value="all">All boards</option>
              {boards.map((board) => <option key={board.id} value={board.id}>{board.title}</option>)}
            </FilterSelect>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                aria-label="Activity from date"
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                aria-label="Activity to date"
                className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500" aria-live="polite">
              Showing {filteredActivities.length} of {activities.length} updates
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md px-2 py-1 text-xs font-semibold text-[#6542F5] hover:bg-[#F5F2FF] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40"
            >
              Clear filters
            </button>
          </div>
        </div>

        {error ? (
          <div role="alert" className="flex items-start gap-3 p-6 text-sm text-rose-700">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <div><p className="font-semibold">Activity unavailable</p><p className="mt-1">{error}</p></div>
          </div>
        ) : isLoading ? (
          <div role="status" className="space-y-4 p-6">
            <span className="sr-only">Loading activity</span>
            {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F1EEFF] text-[#6542F5]">
              <Clock3 aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No activity matches these filters</h3>
            <p className="mt-1 text-sm text-slate-500">Try another search or clear the selected filters.</p>
            <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-[#6542F5] hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <ol className="divide-y divide-[#EEF0F4]">
            {filteredActivities.map((item) => (
              <ActivityRow key={item.id} item={item} board={boardById.get(item.boardId)} />
            ))}
          </ol>
        )}
      </section>
      <p className="text-xs text-slate-400">Sample activity data for interface preview.</p>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/30">
    <span className={`grid size-11 place-items-center rounded-xl ${tone}`}>
      <Icon aria-hidden="true" className="size-5" />
    </span>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const FilterSelect = ({ label, value, onChange, children }) => (
  <label className="space-y-1">
    <span className="text-xs font-medium text-slate-600">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
    >
      {children}
    </select>
  </label>
);

const ActivityRow = ({ item, board }) => {
  const config = activityTypes[item.type] ?? activityTypes.task_updated;
  const Icon = config.icon;

  return (
    <li className="flex gap-3 p-4 sm:gap-4 sm:p-5">
      <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${config.tone}`}>
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-slate-700">
            <span
              aria-hidden="true"
              className={`mr-1 inline-grid size-6 align-middle place-items-center rounded-full text-[9px] font-bold ${item.actor.color}`}
            >
              {item.actor.initials}
            </span>
            <span className="font-semibold text-slate-900">{item.actor.name}</span>{' '}
            {item.detail}
            {item.task && <span className="font-medium text-slate-900"> “{item.task}”</span>}
          </p>
          <time dateTime={item.date} className="shrink-0 text-xs text-slate-500">{formatDateTime(item.date)}</time>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className={`rounded-full px-2.5 py-1 font-medium ${config.tone}`}>{config.label}</span>
          {board ? (
            <Link to={`/admin/boards/${board.id}`} className="font-medium text-slate-500 hover:text-[#6542F5]">
              {board.title}
            </Link>
          ) : <span className="text-slate-400">Board unavailable</span>}
        </div>
      </div>
    </li>
  );
};

export default ActivityPage;
