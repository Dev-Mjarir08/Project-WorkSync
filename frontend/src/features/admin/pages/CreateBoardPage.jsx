import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, FolderKanban } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import adminService from '../adminService';

const CreateBoardPage = () => {
  const navigate = useNavigate();
  const existingBoards = adminService.getBoards();
  const workspaces = useMemo(
    () => [...new Set(existingBoards.map((board) => board.workspace))].sort(),
    [existingBoards]
  );
  const people = useMemo(
    () => [...new Map(
      existingBoards.flatMap((board) => [board.owner, ...board.members])
        .map((member) => [member.id, member])
    ).values()],
    [existingBoards]
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workspace, setWorkspace] = useState(workspaces[0] ?? '');
  const [status, setStatus] = useState('Planning');
  const [ownerId, setOwnerId] = useState(people[0]?.id ?? '');
  const [memberIds, setMemberIds] = useState(() => (
    people[0] ? [people[0].id] : []
  ));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMember = (memberId) => {
    setMemberIds((current) => (
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    ));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Enter a board name.';
    if (title.trim().length > 80) nextErrors.title = 'Board names must be 80 characters or fewer.';
    if (description.length > 500) nextErrors.description = 'Descriptions must be 500 characters or fewer.';
    if (!workspace) nextErrors.workspace = 'Select a workspace.';
    if (!ownerId) nextErrors.owner = 'Select a board owner.';
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const owner = people.find((person) => person.id === ownerId);
      if (!owner) {
        throw new Error('The selected board owner is no longer available.');
      }

      const board = adminService.createBoard({
        title,
        description,
        workspace,
        status,
        owner,
        members: people.filter((person) => memberIds.includes(person.id)),
      });
      navigate(`/admin/boards/${board.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Board could not be created.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/admin/boards" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#6542F5]">
        <ArrowLeft aria-hidden="true" className="size-4" />
        All boards
      </Link>
      <div>
        <p className="mb-2 text-sm font-semibold text-[#6542F5]">Set your team up for success</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create a board</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Give your work a home, choose a workspace, and bring the right people together.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="overflow-hidden rounded-2xl border border-[#E6E7EC] bg-white shadow-sm shadow-slate-200/30">
        <div className="flex items-center gap-3 border-b border-[#EEF0F4] px-5 py-4 sm:px-7">
          <span className="grid size-10 place-items-center rounded-xl bg-[#F1EEFF] text-[#6542F5]">
            <FolderKanban aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Board details</h2>
            <p className="text-xs text-slate-500">You can update these details later.</p>
          </div>
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-7">
          {submitError && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {submitError}
            </div>
          )}
          <div>
            <label htmlFor="board-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              Board name <span className="text-rose-600">*</span>
            </label>
            <input
              id="board-title"
              autoFocus
              required
              maxLength={80}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'board-title-error' : 'board-title-help'}
              placeholder="e.g. Website redesign"
              className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                errors.title
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                  : 'border-[#E6E7EC] focus:border-[#6542F5] focus:ring-[#6542F5]/15'
              }`}
            />
            {errors.title ? (
              <p id="board-title-error" className="mt-1.5 text-xs text-rose-600">{errors.title}</p>
            ) : (
              <p id="board-title-help" className="mt-1.5 text-xs text-slate-500">Use a short, recognizable name for this project.</p>
            )}
          </div>

          <div>
            <label htmlFor="board-description" className="mb-1.5 block text-sm font-medium text-slate-700">
              Description <span className="font-normal text-slate-400">Optional</span>
            </label>
            <textarea
              id="board-description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'board-description-error' : 'board-description-help'}
              placeholder="What is this board for?"
              className={`w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                errors.description
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                  : 'border-[#E6E7EC] focus:border-[#6542F5] focus:ring-[#6542F5]/15'
              }`}
            />
            {errors.description ? (
              <p id="board-description-error" className="mt-1.5 text-xs text-rose-600">{errors.description}</p>
            ) : (
              <p id="board-description-help" className="mt-1.5 text-xs text-slate-500">{description.length}/500 characters</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="board-workspace" className="mb-1.5 block text-sm font-medium text-slate-700">
                Workspace <span className="text-rose-600">*</span>
              </label>
              <select
                id="board-workspace"
                value={workspace}
                onChange={(event) => setWorkspace(event.target.value)}
                aria-invalid={Boolean(errors.workspace)}
                className="h-11 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                {workspaces.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {errors.workspace && <p className="mt-1.5 text-xs text-rose-600">{errors.workspace}</p>}
            </div>
            <div>
              <label htmlFor="board-status" className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                id="board-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
              >
                <option>Planning</option>
                <option>In progress</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="board-owner" className="mb-1.5 block text-sm font-medium text-slate-700">
              Board owner <span className="text-rose-600">*</span>
            </label>
            <select
              id="board-owner"
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
              aria-invalid={Boolean(errors.owner)}
              className="h-11 w-full rounded-xl border border-[#E6E7EC] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#6542F5] focus:ring-2 focus:ring-[#6542F5]/15"
            >
              {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
            {errors.owner && <p className="mt-1.5 text-xs text-rose-600">{errors.owner}</p>}
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Board members</legend>
            <p className="mt-1 text-xs text-slate-500">Select people from the available sample team. The owner is always included.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {people.map((person) => {
                const checked = memberIds.includes(person.id) || ownerId === person.id;
                return (
                  <label key={person.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E6E7EC] p-3 transition hover:border-[#D3CCFF]">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={ownerId === person.id}
                      onChange={() => toggleMember(person.id)}
                      className="size-4 rounded border-slate-300 text-[#6542F5] accent-[#6542F5] focus:ring-[#6542F5]"
                    />
                    <span className={`grid size-8 place-items-center rounded-full text-[10px] font-bold ${person.color}`}>{person.initials}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">{person.name}</span>
                    {ownerId === person.id && <span className="text-xs text-slate-400">Owner</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p className="rounded-xl bg-[#F8F9FC] px-3.5 py-3 text-xs leading-5 text-slate-500">
            This preview stores the board in browser memory only. It will not be saved to a server or remain after a page refresh.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#EEF0F4] bg-[#FCFCFE] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <Link
            to="/admin/boards"
            aria-disabled={isSubmitting}
            className={`inline-flex h-10 items-center justify-center rounded-xl border border-[#E6E7EC] bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 ${
              isSubmitting ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#6542F5] px-4 text-sm font-semibold text-white transition hover:bg-[#5635E0] focus:outline-none focus:ring-2 focus:ring-[#6542F5]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Creating…
              </>
            ) : (
              <>
                <Check aria-hidden="true" className="size-4" />
                Create board
              </>
            )}
          </button>
        </div>
      </form>
      <p className="text-xs text-slate-400">Board details use the current sample data model.</p>
    </div>
  );
};

export default CreateBoardPage;
