
import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  MapPin,
  ClipboardList,
  Users,
  Flag,
  Plus,
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";

// Sample calendar events - frontend only
const initialEvents = [
  {
    id: 1,
    title: "WorkSync Dashboard UI",
    date: "2026-11-05",
    time: "10:00 AM",
    type: "Task",
    description: "Complete the manager dashboard interface.",
    location: "WorkSync Project",
  },
  {
    id: 2,
    title: "Team Weekly Meeting",
    date: "2026-11-06",
    time: "11:30 AM",
    type: "Meeting",
    description: "Discuss project progress and team priorities.",
    location: "Conference Room",
  },
  {
    id: 3,
    title: "Mobile App Design",
    date: "2026-11-09",
    time: "02:00 PM",
    type: "Task",
    description: "Review mobile application design.",
    location: "Mobile Companion App",
  },
  {
    id: 4,
    title: "Real-Time Sync Deadline",
    date: "2026-11-12",
    time: "05:00 PM",
    type: "Deadline",
    description: "Final delivery of the real-time synchronization module.",
    location: "Real-Time Sync Engine",
  },
  {
    id: 5,
    title: "Sprint Planning",
    date: "2026-11-13",
    time: "10:30 AM",
    type: "Meeting",
    description: "Plan upcoming sprint tasks and assignments.",
    location: "Meeting Room A",
  },
  {
    id: 6,
    title: "API Documentation",
    date: "2026-11-16",
    time: "12:00 PM",
    type: "Task",
    description: "Review and complete API documentation.",
    location: "WorkSync Project",
  },
  {
    id: 7,
    title: "Client Portal Deadline",
    date: "2026-11-20",
    time: "04:00 PM",
    type: "Deadline",
    description: "Submit the client onboarding portal.",
    location: "Client Onboarding Portal",
  },
  {
    id: 8,
    title: "Team Performance Review",
    date: "2026-11-24",
    time: "03:00 PM",
    type: "Meeting",
    description: "Review team performance and workload.",
    location: "Conference Room",
  },
  {
    id: 9,
    title: "Analytics Module",
    date: "2026-11-27",
    time: "01:00 PM",
    type: "Task",
    description: "Complete analytics and reporting module.",
    location: "Analytics & Reporting Hub",
  },
];

const eventStyles = {
  Task: {
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: ClipboardList,
  },
  Meeting: {
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    icon: Users,
  },
  Deadline: {
    color: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: Flag,
  },
};

const filters = ["All", "Task", "Meeting", "Deadline"];

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const CalendarPage = () => {
  const today = new Date();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [events] = useState(initialEvents);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));
  const [activeFilter, setActiveFilter] = useState("All");

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === "All" || event.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [events, searchQuery, activeFilter]);

  const monthEvents = filteredEvents.filter((event) => {
    const eventDate = new Date(`${event.date}T00:00:00`);

    return (
      eventDate.getMonth() === currentMonth.getMonth() &&
      eventDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const selectedEvents = monthEvents
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const counts = {
    Task: monthEvents.filter((event) => event.type === "Task").length,
    Meeting: monthEvents.filter((event) => event.type === "Meeting").length,
    Deadline: monthEvents.filter((event) => event.type === "Deadline").length,
  };

  // Build calendar grid with Monday as the first day.
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const startingDay = (firstDay.getDay() + 6) % 7;

  const calendarDays = [
    ...Array.from({ length: startingDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(formatDateKey(today));
  };

  const getEventsForDay = (day) => {
    const date = formatDateKey(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      )
    );

    return monthEvents.filter((event) => event.date === date);
  };

  const handleDateSelect = (day) => {
    if (!day) return;

    setSelectedDate(
      formatDateKey(
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          day
        )
      )
    );
  };

  const selectedDateLabel = new Date(
    `${selectedDate}T00:00:00`
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      <Sidebar
        activeItem="calendar"
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Shared Header */}
        <Header
          setMobileOpen={setMobileMenuOpen}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          searchPlaceholder="Search calendar events..."
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* Page Heading */}
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Calendar
                </h1>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                  {monthEvents.length} Events
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Manage tasks, meetings, and project deadlines in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={goToToday}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CalendarDays size={16} />
              Today
            </button>
          </section>

          {/* Summary Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              title="Tasks"
              count={counts.Task}
              icon={ClipboardList}
              color="blue"
            />
            <SummaryCard
              title="Meetings"
              count={counts.Meeting}
              icon={Users}
              color="purple"
            />
            <SummaryCard
              title="Deadlines"
              count={counts.Deadline}
              icon={Flag}
              color="rose"
            />
          </section>

          {/* Calendar */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

            {/* Calendar Grid */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* Calendar Toolbar */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {monthName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a date to view scheduled events.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    aria-label="Previous month"
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={goToNextMonth}
                    aria-label="Next month"
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Event Filters */}
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      activeFilter === filter
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter === "All" ? "All Events" : `${filter}s`}
                  </button>
                ))}
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-3 text-center text-xs font-semibold text-slate-500"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar Dates */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const dateKey = day
                    ? formatDateKey(
                        new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          day
                        )
                      )
                    : null;

                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isToday = dateKey === formatDateKey(today);
                  const isSelected = dateKey === selectedDate;

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!day}
                      onClick={() => handleDateSelect(day)}
                      className={`min-h-[92px] sm:min-h-[116px] p-1.5 sm:p-2 border-r border-b border-slate-100 text-left transition ${
                        !day
                          ? "bg-slate-50/50 cursor-default"
                          : isSelected
                          ? "bg-blue-50/70"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      {day && (
                        <>
                          <span
                            className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-semibold ${
                              isToday
                                ? "bg-blue-600 text-white"
                                : isSelected
                                ? "bg-blue-100 text-blue-700"
                                : "text-slate-700"
                            }`}
                          >
                            {day}
                          </span>

                          <div className="mt-1.5 space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`rounded px-1 py-1 text-[9px] sm:text-[10px] font-semibold truncate border ${
                                  eventStyles[event.type].color
                                }`}
                              >
                                {event.title}
                              </div>
                            ))}

                            {dayEvents.length > 2 && (
                              <p className="text-[9px] text-slate-400 font-medium">
                                +{dayEvents.length - 2} more
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="px-4 sm:px-5 py-4 flex flex-wrap gap-4 border-t border-slate-100">
                {Object.entries(eventStyles).map(([type, style]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <span className="text-xs text-slate-500">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Date Events */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">
                  Scheduled Events
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedDateLabel}
                </p>
              </div>

              <div className="p-4 space-y-3">
                {selectedEvents.length > 0 ? (
                  selectedEvents.map((event) => {
                    const style = eventStyles[event.type];
                    const Icon = style.icon;

                    return (
                      <div
                        key={event.id}
                        className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.color}`}>
                            <Icon size={17} />
                          </div>

                          <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${style.color}`}>
                            {event.type}
                          </span>
                        </div>

                        <h3 className="mt-3 text-sm font-bold text-slate-800">
                          {event.title}
                        </h3>

                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {event.description}
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={14} />
                            {event.time}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin size={14} />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center">
                      <CalendarDays size={22} className="text-slate-400" />
                    </div>

                    <h3 className="mt-3 text-sm font-semibold text-slate-700">
                      No events scheduled
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      There are no events for this date.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-4 pb-4">
                <p className="text-[11px] text-slate-400 text-center">
                  Calendar events are currently sample data.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

// Summary Card
const SummaryCard = ({ title, count, icon: Icon, color }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">
            {count}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            This month
          </p>
        </div>

        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${styles[color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;