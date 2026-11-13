import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Mail,
  Users,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import adminService from '../adminService';

const taskStatusStyles = {
  'To do': 'bg-slate-100 text-slate-600',
  'In progress': 'bg-violet-50 text-violet-700',
  Done: 'bg-emerald-50 text-emerald-700',
};

const formatDate = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Intl.DateTimeFormat('en', options).format(new Date(value));

const getInitials = (name) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase();

const MemberDetailsPage = () => {
  const { memberId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setBoards(adminService.getBoards());
      setActivities(adminService.getActivities());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Member details could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const member = useMemo(() => {
    const boardMembers = boards.flatMap((board) => [board.owner, ...board.members]);
    const membersById = new Map(boardMembers.map((person) => [person.id, person]));
    const selectedMember = location.state?.member;
    return membersById.get(memberId) ?? (
      selectedMember?.id ? membersById.get(selectedMember.id) ?? selectedMember : null
    );
  }, [boards, location.state, memberId]);

  const memberBoards = useMemo(() => (
    member
      ? boards.filter((board) => (
        board.owner.id === member.id || board.members.some((person) => person.id === member.id)
      ))
      : []
  ), [boards, member]);

  const assignedTasks = useMemo(() => (
    memberBoards.flatMap((board) => (
      board.tasks
        .filter((task) => task.assignee.id === member.id)
        .map((task) => ({ ...task, boardTitle: board.title }))
    ))
  ), [member, memberBoards]);

  const memberActivities = useMemo(() => {
    if (!member) return [];
    const boardTitles = new Map(boards.map((board) => [board.id, board.title]));
    return activities
      .filter((item) => item.actor.id === member.id)
      .sort((first, second) => new Date(second.date) - new Date(first.date))
      .map((item) => ({ ...item, boardTitle: boardTitles.get(item.boardId) }));
  }, [activities, boards, member]);

  const taskCounts = useMemo(() => ({
    total: assignedTasks.length,
    done: assignedTasks.filter((task) => task.status === 'Done').length,
    inProgress: assignedTasks.filter((task) => task.status === 'In progress').length,
    toDo: assignedTasks.filter((task) => task.status === 'To do').length,
  }), [assignedTasks]);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/admin/boards');
    }
  };

  if (isLoading) {
    return (
      <div role="status" className="space-y-4">
        <span className="sr-only">Loading member details</span>
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-44 animate-pulse rounded-2xl bg-white" />
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <section className="rounded-2xl border border-[#E6E7EC] bg-white px-6 py-14 text-center shadow-sm shadow-slate-200/30">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertCircle aria-hidden="true" className="size-5" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">
          {error ? 'Member details unavailable' : 'Member not found'}
        </h1>
        <p role={error ? 'alert' : undefined} className="mt-2 text-sm text-slate-500">
          {error || 'This member may no longer be part of a board, or the link may be incorrect.'}
        </p>
        <button
          type="button"
          onClick={goBack}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6542F5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to members
        </button>
      </section>
    );
  }

  const taskStats = [
    { label: 'Assigned tasks', value: taskCounts.total, icon: ListTodo, tone: 'bg-[#F1EEFF] text-[#6542F5]' },
    { label: 'In progress', value: taskCounts.inProgress, icon: Clock3, tone: 'bg-[#EAF2FF] text-[#3971C6]' },
    { label: 'Completed', value: taskCounts.done, icon: CheckCircle2, tone: 'bg-[#E2F5F3] text-[#278A8F]' },
    { label: 'To do', value: taskCounts.toDo, icon: Circle, tone: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/admin/dashboard" className="transition hover:text-[#6542F5]">Admin</Link>
          <span aria-hidden="true">/</span>
          <Link to="/admin/boards" className="transition hover:text-[#6542F5]">Members</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-medium text-slate-700">Member details</span>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-semibold text-[#6542F5]">Team member</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{member.name}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Member details and work across assigned boards.
            </p>
          </div>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl border border-[#E6E7EC] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-[#6542F5]/30 hover:text-[#6542F5] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/30 focus:ring-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to members
          </button>
        </div>
      </div>

      <section aria-label="Member profile" className="rounded-2xl border border-[#E6E7EC] bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className={`grid size-20 shrink-0 place-items-center rounded-2xl text-2xl font-bold ${member.color ?? 'bg-[#F1EEFF] text-[#6542F5]'}`}>
            {member.initials || getInitials(member.name)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-xl font-bold text-slate-900">{member.name}</h2>
            <p className="mt-1 text-sm text-slate-500">Board collaborator</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <BriefcaseBusiness aria-hidden="true" className="size-4 text-slate-400" />
                {memberBoards.length} {memberBoards.length === 1 ? 'board' : 'boards'}
              </span>
              <span className="inline-flex items-center gap-2">
                <ListTodo aria-hidden="true" className="size-4 text-slate-400" />
                {taskCounts.total} assigned {taskCounts.total === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#E2F5F3] px-3 py-1.5 text-xs font-semibold text-[#247A7F]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#43B6BC]" />
            Board member
          </span>
        </div>
      </section>

      <section aria-label="Task statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {taskStats.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-2xl border border-[#E6E7EC] bg-white p-4 shadow-sm shadow-slate-200/25 sm:p-5">
            <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
          <div className="border-b border-[#E6E7EC] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#F1EEFF] text-[#6542F5]">
                <BriefcaseBusiness aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">Assigned boards</h2>
                <p className="mt-0.5 text-sm text-slate-500">{memberBoards.length} associated</p>
              </div>
            </div>
          </div>
          {memberBoards.length ? (
            <ul className="divide-y divide-[#EEF0F4]">
              {memberBoards.map((board) => (
                <li key={board.id} className="flex min-w-0 items-start justify-between gap-4 p-4 sm:p-5">
                  <div className="min-w-0">
                    <Link to={`/admin/boards/${board.id}`} className="break-words text-sm font-semibold text-slate-900 transition hover:text-[#6542F5]">
                      {board.title}
                      <ArrowUpRight aria-hidden="true" className="ml-1 inline size-3.5" />
                    </Link>
                    <p className="mt-1 break-words text-sm text-slate-500">{board.workspace}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {board.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-slate-500">No board assignments are available.</p>
          )}
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
          <div className="border-b border-[#E6E7EC] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#E2F5F3] text-[#278A8F]">
                <Activity aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">Recent activity</h2>
                <p className="mt-0.5 text-sm text-slate-500">Recorded updates by this member</p>
              </div>
            </div>
          </div>
          {memberActivities.length ? (
            <ol className="divide-y divide-[#EEF0F4]">
              {memberActivities.map((item) => (
                <li key={item.id} className="flex gap-3 p-4 sm:p-5">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#F1EEFF] text-[#6542F5]">
                    {item.type === 'task_completed'
                      ? <CheckCircle2 aria-hidden="true" className="size-4" />
                      : item.type === 'member_added'
                        ? <Users aria-hidden="true" className="size-4" />
                        : <Activity aria-hidden="true" className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-slate-800">
                      {item.detail}{item.task ? `: ${item.task}` : ''}
                    </p>
                    {item.boardTitle && <p className="mt-1 break-words text-xs text-slate-500">{item.boardTitle}</p>}
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      {formatDate(item.date, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="p-5 text-sm text-slate-500">No activity is available for this member.</p>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
        <div className="border-b border-[#E6E7EC] p-5">
          <h2 className="font-semibold text-slate-900">Assigned tasks</h2>
          <p className="mt-1 text-sm text-slate-500">Tasks assigned to this member on their boards.</p>
        </div>
        {assignedTasks.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-[#F8F9FC] text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Task</th>
                  <th scope="col" className="px-5 py-3">Board</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Due date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F4]">
                {assignedTasks.map((task) => (
                  <tr key={task.id} className="text-slate-700">
                    <td className="max-w-72 px-5 py-4 font-medium text-slate-900">{task.title}</td>
                    <td className="max-w-56 px-5 py-4 text-slate-600">{task.boardTitle}</td>
                    <td className="px-5 py-4">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${taskStatusStyles[task.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(`${task.dueDate}T12:00:00`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-slate-500">No assigned tasks are available.</p>
        )}
      </section>

      <p className="flex items-center gap-2 rounded-xl border border-[#E6E7EC] bg-white px-4 py-3 text-xs leading-5 text-slate-500">
        <Mail aria-hidden="true" className="size-4 shrink-0 text-slate-400" />
        Contact details, role permissions, membership status, and join date are not provided by the available member data.
      </p>
    </div>
  );
};

export default MemberDetailsPage;
