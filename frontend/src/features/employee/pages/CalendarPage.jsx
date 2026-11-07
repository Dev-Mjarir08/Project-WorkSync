import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock3,
  Video,
  Users,
  MapPin,
  X,
  Search,
  CalendarCheck,
  AlarmClock,
  CheckCircle2,
  LayoutGrid,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import { getUserItem, setUserItem } from "../../../utils/userStorage.js";

const initialEvents = [];

const typeStyles = {
  Meeting: {
    badge:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    dot: "bg-blue-500",
    border: "border-l-blue-500",
    icon: Video,
  },
  Review: {
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    dot: "bg-violet-500",
    border: "border-l-violet-500",
    icon: Users,
  },
  Deadline: {
    badge:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    dot: "bg-rose-500",
    border: "border-l-rose-500",
    icon: AlarmClock,
  },
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

const pad = (value) => String(value).padStart(2, "0");

const toDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatDate = (dateKey) => {
  const date = new Date(`${dateKey}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatMonth = (date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

const formatTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(
    new Date()
  );

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [events, setEvents] = useState(() => getUserItem("employee_events", []));
  const [filterType, setFilterType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("Meeting");
  const [eventDate, setEventDate] = useState("2026-11-02");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:30");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [modalError, setModalError] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, previousMonthDays - i);

      cells.push({
        date,
        key: toDateKey(date),
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);

      cells.push({
        date,
        key: toDateKey(date),
        isCurrentMonth: true,
      });
    }

    let nextDay = 1;

    while (cells.length < 35 || cells.length % 7 !== 0) {
      const date = new Date(year, month + 1, nextDay++);

      cells.push({
        date,
        key: toDateKey(date),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  const selectedEvents = useMemo(() => {
    return events
      .filter((event) => {
        const matchesDate = event.date === selectedDate;

        const matchesType =
          filterType === "All" || event.type === filterType;

        const matchesSearch = event.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        return matchesDate && matchesType && matchesSearch;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, selectedDate, filterType, searchQuery]);

  const monthEvents = events.filter((event) => {
    const [eventYear, eventMonth] = event.date.split("-").map(Number);

    return eventYear === year && eventMonth === month + 1;
  });

  const meetingCount = monthEvents.filter(
    (event) => event.type === "Meeting"
  ).length;

  const reviewCount = monthEvents.filter(
    (event) => event.type === "Review"
  ).length;

  const deadlineCount = monthEvents.filter(
    (event) => event.type === "Deadline"
  ).length;

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();

    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    setSelectedDate(toDateKey(today));
  };

  const openCreateModal = () => {
    setModalError("");
    setEventTitle("");
    setEventType("Meeting");
    setEventDate(selectedDate);
    setStartTime("10:00");
    setEndTime("10:30");
    setEventLocation("");
    setEventDescription("");
    setIsModalOpen(true);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();

    if (!eventTitle.trim()) return;

    if (endTime <= startTime) {
      setModalError("End time must be later than start time.");
      return;
    }

    const newEvent = {
      id: Date.now(),
      title: eventTitle.trim(),
      type: eventType,
      date: eventDate,
      startTime,
      endTime,
      location: eventLocation.trim() || "Not specified",
      description: eventDescription.trim(),
    };

    setEvents((previous) => {
      const updated = [...previous, newEvent];
      setUserItem("employee_events", updated);
      return updated;
    });
    setSelectedDate(eventDate);

    const [eventYear, eventMonth] = eventDate.split("-").map(Number);

    setCurrentMonth(new Date(eventYear, eventMonth - 1, 1));
    setFilterType("All");
    setSearchQuery("");
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id) => {
    setEvents((previous) => {
      const updated = previous.filter((event) => event.id !== id);
      setUserItem("employee_events", updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        {/* Page Header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
              <CalendarDays size={27} />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Workspace / Calendar
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Calendar & Events
              </h1>

              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Keep your meetings, deadlines, and team activities organized.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 active:scale-[0.98]"
          >
            <Plus size={18} />
            Create event
          </button>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total events"
            value={monthEvents.length}
            subtitle="Scheduled this month"
            icon={CalendarCheck}
            iconClass="bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
          />

          <SummaryCard
            title="Team meetings"
            value={meetingCount}
            subtitle="Meetings and syncs"
            icon={Users}
            iconClass="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
          />

          <SummaryCard
            title="Reviews"
            value={reviewCount}
            subtitle="Reviews and demos"
            icon={CheckCircle2}
            iconClass="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
          />

          <SummaryCard
            title="Deadlines"
            value={deadlineCount}
            subtitle="Important deliverables"
            icon={AlarmClock}
            iconClass="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
          />
        </section>

        {/* Main Calendar Layout */}
        <section className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
          {/* Calendar */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Calendar Toolbar */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold">
                  {formatMonth(currentMonth)}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Select a date to view your agenda
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Today
                </button>

                <button
                  onClick={goToPreviousMonth}
                  aria-label="Previous month"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={goToNextMonth}
                  aria-label="Next month"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-3 sm:p-6">
              <div className="mb-3 grid grid-cols-7">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs"
                    >
                      <span className="sm:hidden">{day.slice(0, 1)}</span>
                      <span className="hidden sm:inline">{day}</span>
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((cell) => {
                  const isSelected = cell.key === selectedDate;

                  const isToday = cell.key === toDateKey(new Date());

                  const dayEvents = events.filter(
                    (event) => event.date === cell.key
                  );

                  return (
                    <button
                      key={cell.key}
                      onClick={() => {
                        setSelectedDate(cell.key);

                        if (!cell.isCurrentMonth) {
                          setCurrentMonth(
                            new Date(
                              cell.date.getFullYear(),
                              cell.date.getMonth(),
                              1
                            )
                          );
                        }
                      }}
                      className={`group relative flex min-h-[68px] flex-col items-center rounded-xl border p-1.5 transition sm:min-h-[100px] sm:items-start sm:p-3 ${
                        isSelected
                          ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/20"
                          : cell.isCurrentMonth
                            ? "border-slate-100 bg-white hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-700 dark:hover:bg-teal-950/20"
                            : "border-transparent bg-slate-50/70 text-slate-300 dark:bg-slate-950/50 dark:text-slate-600"
                      }`}
                    >
                      <div className="flex w-full items-center justify-center sm:justify-between">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-8 sm:w-8 sm:text-sm ${
                            isSelected
                              ? "bg-white/15 text-white"
                              : isToday
                                ? "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300"
                                : ""
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>

                        {isToday && !isSelected && (
                          <span className="hidden text-[10px] font-bold text-teal-600 dark:text-teal-400 sm:block">
                            TODAY
                          </span>
                        )}
                      </div>

                      {/* Event indicators */}
                      <div className="mt-2 flex min-h-1.5 items-center justify-center gap-1 sm:justify-start">
                        {dayEvents.slice(0, 3).map((event) => (
                          <span
                            key={event.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              isSelected
                                ? "bg-white"
                                : typeStyles[event.type]?.dot || "bg-teal-500"
                            }`}
                          />
                        ))}

                        {dayEvents.length > 3 && (
                          <span
                            className={`text-[9px] font-bold ${
                              isSelected
                                ? "text-white"
                                : "text-slate-400"
                            }`}
                          >
                            +{dayEvents.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Event labels on larger screens */}
                      {dayEvents.length > 0 && (
                        <div className="mt-1 hidden w-full space-y-1 lg:block">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`truncate rounded px-1.5 py-1 text-left text-[9px] font-semibold ${
                                isSelected
                                  ? "bg-white/15 text-white"
                                  : typeStyles[event.type]?.badge
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                {Object.entries(typeStyles).map(([type, style]) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                  >
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Agenda */}
          <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-5 text-white sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-teal-100">
                  Your schedule
                </span>

                <div className="rounded-lg bg-white/15 p-2">
                  <CalendarDays size={18} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                  "en-US",
                  { day: "numeric" }
                )}
                <span className="ml-2 text-base font-medium text-teal-100">
                  {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )}
                </span>
              </h2>

              <p className="mt-1 text-sm text-teal-100">
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                  "en-US",
                  { weekday: "long" }
                )}
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs font-medium text-teal-50">
                <CalendarCheck size={15} />
                {events.filter((event) => event.date === selectedDate).length}{" "}
                events scheduled
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* Search */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Type Filters */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["All", "Meeting", "Review", "Deadline"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`rounded-lg px-2.5 py-2 text-[10px] font-semibold transition sm:text-xs ${
                      filterType === type
                        ? "bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Agenda Header */}
              <div className="mb-4 mt-6 flex items-center justify-between">
                <h3 className="text-sm font-bold">Agenda</h3>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {selectedEvents.length} events
                </span>
              </div>

              {/* Agenda Events */}
              {selectedEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedEvents.map((event) => {
                    const style =
                      typeStyles[event.type] || typeStyles.Meeting;

                    const Icon = style.icon;

                    return (
                      <article
                        key={event.id}
                        className={`relative rounded-xl border border-slate-100 border-l-[3px] ${style.border} bg-white p-3.5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.badge}`}
                          >
                            <Icon size={17} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-1 text-[9px] font-bold ${style.badge}`}
                              >
                                {event.type}
                              </span>
                            </div>

                            <h4 className="mt-2 text-sm font-semibold leading-5 text-slate-800 dark:text-slate-100">
                              {event.title}
                            </h4>

                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <Clock3 size={13} className="shrink-0" />
                              {formatTime(event.startTime)} –{" "}
                              {formatTime(event.endTime)}
                            </div>

                            <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <MapPin
                                size={13}
                                className="mt-0.5 shrink-0"
                              />
                              <span className="break-words">
                                {event.location}
                              </span>
                            </div>

                            {event.description && (
                              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {event.description}
                              </p>
                            )}

                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="mt-3 text-[11px] font-semibold text-slate-400 transition hover:text-rose-500"
                            >
                              Remove event
                            </button>
                          </div>

                          <MoreHorizontal
                            size={18}
                            className="shrink-0 text-slate-400"
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center dark:border-slate-700">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <CalendarDays size={23} />
                  </div>

                  <h4 className="mt-4 text-sm font-semibold">
                    No events found
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    No events match this date and filter. Create an event to
                    keep your schedule up to date.
                  </p>

                  <button
                    onClick={openCreateModal}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                  >
                    <Plus size={15} />
                    Add event
                  </button>
                </div>
              )}

              <button
                onClick={openCreateModal}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-xs font-semibold text-slate-500 transition hover:border-teal-500 hover:bg-teal-50/50 hover:text-teal-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-teal-950/20 dark:hover:text-teal-300"
              >
                <Plus size={15} />
                Add another event
                <ArrowUpRight size={14} />
              </button>
            </div>
          </aside>
        </section>

        {/* Bottom Information */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              <LayoutGrid size={17} />
            </div>

            <div>
              <p className="text-xs font-semibold">
                Stay organized with WorkSync
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                Your meetings and project deadlines, all in one place.
              </p>
            </div>
          </div>

          <span className="text-[11px] text-slate-400">
            {monthEvents.length} scheduled events this month
          </span>
        </div>
      </div>

      {/* Create Event Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-event-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  <CalendarCheck size={21} />
                </div>

                <div>
                  <h2
                    id="create-event-title"
                    className="text-lg font-bold"
                  >
                    Create an event
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Add a new event to your calendar.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEvent} className="space-y-5 p-5 sm:p-6">
              {modalError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                  {modalError}
                </div>
              )}
              <div>
                <label
                  htmlFor="event-title"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Event title <span className="text-rose-500">*</span>
                </label>

                <input
                  id="event-title"
                  type="text"
                  required
                  autoFocus
                  maxLength={100}
                  placeholder="e.g. Weekly team meeting"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="event-type"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Event category
                </label>

                <select
                  id="event-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className={inputClass}
                >
                  <option value="Meeting">Team meeting</option>
                  <option value="Review">Review / Demo</option>
                  <option value="Deadline">Project deadline</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="event-date"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Date
                </label>

                <input
                  id="event-date"
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="start-time"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Start time
                  </label>

                  <input
                    id="start-time"
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="end-time"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    End time
                  </label>

                  <input
                    id="end-time"
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-location"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Location
                </label>

                <input
                  id="event-location"
                  type="text"
                  placeholder="Google Meet, Office, or project name"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Description
                </label>

                <textarea
                  id="event-description"
                  rows={3}
                  maxLength={500}
                  placeholder="Add a few details about this event..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700"
                >
                  <Plus size={17} />
                  Create event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}