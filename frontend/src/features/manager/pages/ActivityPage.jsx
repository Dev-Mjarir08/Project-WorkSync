import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Activity,
  MessageSquare,
  ListTodo,
  Users,
  FolderKanban,
  Search,
  Filter,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ArrowRight,
  Send,
  Heart,
  MessageCircle,
  Sparkles,
  Download,
  RefreshCw,
  ChevronRight,
  X,
  Bookmark,
  GitPullRequest,
  Terminal,
  Shield,
  Copy,
  Check,
  Layers,
  ArrowUpDown,
  CornerDownRight,
  User,
  Plus,
  TrendingUp,
  Tag,
  AtSign,
} from "lucide-react";

import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import managerService from "../managerService.js";


// Standard team members from workspace
const teamMembersListFallback = [
  { id: "tm-1", name: "Devanshi Sharma", role: "Engineering Manager", avatar: "DS", color: "from-blue-600 to-indigo-600" },
  { id: "tm-2", name: "Ayan Mukherjee", role: "Fullstack Admin", avatar: "AM", color: "from-cyan-500 to-blue-600" },
  { id: "tm-3", name: "Rouhan Siddiqui", role: "Frontend Dev", avatar: "RS", color: "from-emerald-500 to-teal-600" },
  { id: "tm-4", name: "Priya Shah", role: "Backend Dev", avatar: "PS", color: "from-violet-500 to-purple-600" },
  { id: "tm-5", name: "Rohan Mehta", role: "DevOps Engineer", avatar: "RM", color: "from-teal-500 to-emerald-600" },
  { id: "tm-6", name: "Aarav Patel", role: "UI/UX Designer", avatar: "AP", color: "from-pink-500 to-rose-600" },
  { id: "tm-7", name: "Sneha Desai", role: "QA Engineer", avatar: "SD", color: "from-amber-500 to-orange-600" },
];

// Standard projects catalog
const projectsListFallback = [
  { id: "proj-1", name: "WorkSync Web App" },
  { id: "proj-2", name: "Mobile Companion App" },
  { id: "proj-3", name: "Real-Time Sync Engine" },
  { id: "proj-4", name: "Enterprise Security Audit" },
  { id: "proj-5", name: "Analytics & Reporting Hub" },
];

// Standard task options for referencing
const tasksListFallback = [
  { id: "task-1", title: "Implement WebSocket connection and live presence sync", projectId: "proj-1" },
  { id: "task-2", title: "Design light theme SaaS workspace layout and card tokens", projectId: "proj-1" },
  { id: "task-3", title: "Build Kanban board column state and status transition handlers", projectId: "proj-1" },
  { id: "task-4", title: "Configure role-based access control and manager route guards", projectId: "proj-1" },
  { id: "task-5", title: "Audit client-side bundle size and verify Vite code splitting", projectId: "proj-2" },
  { id: "task-6", title: "Write integration tests for sprint burn-down calculations", projectId: "proj-1" },
  { id: "task-7", title: "Deploy staging environment and configure automated CI pipeline", projectId: "proj-3" },
  { id: "task-13", title: "Optimize Redis pub/sub channels for cursor presence", projectId: "proj-3" },
  { id: "task-14", title: "Setup OAuth token rotation and session invalidation", projectId: "proj-4" },
];

// Initial realistic dataset focused on:
// 1. Recent task updates (status, priority, deadline, assignment)
// 2. Comments & discussions (with replies, reactions, @mentions)
// 3. Team activities (sprint milestones, PR reviews, member onboarding)
const initialFeedDataFallback = [
  {
    id: "act-201",
    category: "task_update", // 'task_update' | 'comment' | 'team_activity'
    actionType: "Task Completed",
    title: "Implement WebSocket connection and live presence sync",
    content: "Marked task as Completed after verifying sub-40ms latency benchmarks and passing automated failover retries.",
    actor: {
      name: "Ayan Mukherjee",
      role: "Fullstack Admin",
      avatar: "AM",
      color: "from-cyan-500 to-blue-600",
      email: "ayan.mukherjee@worksync.io",
    },
    project: { id: "proj-1", name: "WorkSync Web App" },
    task: { id: "task-1", title: "Implement WebSocket connection and live presence sync" },
    timestamp: "10m ago",
    dateGroup: "Today",
    isoTime: "2026-11-02T19:55:00Z",
    diff: {
      label: "Status Changed",
      from: "In Review",
      to: "Completed",
      badgeColor: "emerald",
    },
    starred: true,
  },
  {
    id: "act-202",
    category: "comment",
    actionType: "Comment Added",
    title: "Commented on 'Build Kanban board column state'",
    content: "Hey @Rouhan Siddiqui, the drag animation on touch devices is super smooth now! Just verify column re-order state persistence on page reload.",
    actor: {
      name: "Devanshi Sharma",
      role: "Engineering Manager",
      avatar: "DS",
      color: "from-blue-600 to-indigo-600",
      email: "devanshi.sharma@worksync.io",
    },
    project: { id: "proj-1", name: "WorkSync Web App" },
    task: { id: "task-3", title: "Build Kanban board column state and status transition handlers" },
    timestamp: "24m ago",
    dateGroup: "Today",
    isoTime: "2026-11-02T19:40:00Z",
    likesCount: 3,
    hasLiked: false,
    replies: [
      {
        id: "rep-1",
        actor: {
          name: "Rouhan Siddiqui",
          role: "Frontend Dev",
          avatar: "RS",
          color: "from-emerald-500 to-teal-600",
        },
        text: "Thanks @Devanshi Sharma! Storing the board column arrangement in localStorage with Redux sync as we speak.",
        timestamp: "14m ago",
      },
    ],
    starred: false,
  },
  {
    id: "act-203",
    category: "task_update",
    actionType: "Assignment Updated",
    title: "Assigned 'Audit client-side bundle size' to Rouhan Siddiqui",
    content: "Reallocated task ownership to optimize Vite vendor chunk splitting before staging release.",
    actor: {
      name: "Devanshi Sharma",
      role: "Engineering Manager",
      avatar: "DS",
      color: "from-blue-600 to-indigo-600",
      email: "devanshi.sharma@worksync.io",
    },
    project: { id: "proj-2", name: "Mobile Companion App" },
    task: { id: "task-5", title: "Audit client-side bundle size and verify Vite code splitting" },
    timestamp: "1h ago",
    dateGroup: "Today",
    isoTime: "2026-11-02T18:50:00Z",
    diff: {
      label: "Assignee Reallocated",
      from: "Unassigned",
      to: "Rouhan Siddiqui",
      badgeColor: "blue",
    },
    starred: false,
  },
  {
    id: "act-204",
    category: "team_activity",
    actionType: "Pull Request Approved",
    title: "Approved PR #39: Redis cluster backpressure handling",
    content: "Code review approved with zero blocking comments. Validated automated circuit breaker retry policies.",
    actor: {
      name: "Ayan Mukherjee",
      role: "Fullstack Admin",
      avatar: "AM",
      color: "from-cyan-500 to-blue-600",
      email: "ayan.mukherjee@worksync.io",
    },
    project: { id: "proj-3", name: "Real-Time Sync Engine" },
    task: { id: "task-13", title: "Optimize Redis pub/sub channels for cursor presence" },
    timestamp: "2h 15m ago",
    dateGroup: "Today",
    isoTime: "2026-11-02T17:45:00Z",
    diff: {
      label: "Review Status",
      from: "Changes Requested",
      to: "Approved & Ready to Merge",
      badgeColor: "purple",
    },
    starred: true,
  },
  {
    id: "act-205",
    category: "comment",
    actionType: "Comment Added",
    title: "Commented on 'Setup OAuth token rotation'",
    content: "Refactored the token rotation middleware to automatically blacklist superseded refresh tokens in Redis. Ready for security audit verification.",
    actor: {
      name: "Priya Shah",
      role: "Backend Dev",
      avatar: "PS",
      color: "from-violet-500 to-purple-600",
      email: "priya.shah@worksync.io",
    },
    project: { id: "proj-4", name: "Enterprise Security Audit" },
    task: { id: "task-14", title: "Setup OAuth token rotation and session invalidation" },
    timestamp: "3h ago",
    dateGroup: "Today",
    isoTime: "2026-11-02T17:00:00Z",
    likesCount: 5,
    hasLiked: true,
    replies: [],
    starred: false,
  },
  {
    id: "act-206",
    category: "task_update",
    actionType: "Status Changed",
    title: "Moved 'Configure role-based access control' to In Progress",
    content: "Started writing route guard middleware for /manager/* subpaths and manager workspace permissions.",
    actor: {
      name: "Devanshi Sharma",
      role: "Engineering Manager",
      avatar: "DS",
      color: "from-blue-600 to-indigo-600",
      email: "devanshi.sharma@worksync.io",
    },
    project: { id: "proj-1", name: "WorkSync Web App" },
    task: { id: "task-4", title: "Configure role-based access control and manager route guards" },
    timestamp: "4h 30m ago",
    dateGroup: "Today",
    isoTime: "2026-11-02T15:30:00Z",
    diff: {
      label: "Status Changed",
      from: "To Do",
      to: "In Progress",
      badgeColor: "amber",
    },
    starred: false,
  },
  {
    id: "act-207",
    category: "team_activity",
    actionType: "Sprint Milestone",
    title: "Milestone 2 Achieved: Real-Time Board Engine v1.0",
    content: "All 18 core deliverables completed on schedule for Sprint 4 with zero open blocker bugs.",
    actor: {
      name: "Devanshi Sharma",
      role: "Engineering Manager",
      avatar: "DS",
      color: "from-blue-600 to-indigo-600",
      email: "devanshi.sharma@worksync.io",
    },
    project: { id: "proj-1", name: "WorkSync Web App" },
    timestamp: "Yesterday at 4:20 PM",
    dateGroup: "Yesterday",
    isoTime: "2026-11-01T16:20:00Z",
    diff: {
      label: "Milestone Reached",
      from: "92% Complete",
      to: "100% Complete",
      badgeColor: "emerald",
    },
    starred: true,
  },
  {
    id: "act-208",
    category: "comment",
    actionType: "Comment Added",
    title: "Commented on 'Design light theme SaaS workspace layout'",
    content: "All design system color tokens have been exported to Tailwind v4 CSS variables! Check out the updated styles in index.css.",
    actor: {
      name: "Aarav Patel",
      role: "UI/UX Designer",
      avatar: "AP",
      color: "from-pink-500 to-rose-600",
      email: "aarav.patel@worksync.io",
    },
    project: { id: "proj-1", name: "WorkSync Web App" },
    task: { id: "task-2", title: "Design light theme SaaS workspace layout and card tokens" },
    timestamp: "Yesterday at 2:15 PM",
    dateGroup: "Yesterday",
    isoTime: "2026-11-01T14:15:00Z",
    likesCount: 4,
    hasLiked: false,
    replies: [
      {
        id: "rep-2",
        actor: {
          name: "Devanshi Sharma",
          role: "Engineering Manager",
          avatar: "DS",
          color: "from-blue-600 to-indigo-600",
        },
        text: "Checked them out - the soft slate palette and elevation shadows look exceptionally clean!",
        timestamp: "Yesterday at 2:40 PM",
      },
    ],
    starred: false,
  },
  {
    id: "act-209",
    category: "task_update",
    actionType: "Priority Escalated",
    title: "Escalated 'Setup OAuth token rotation' to High Priority",
    content: "Priority bumped up due to upcoming SOC2 security compliance deadline on Nov 15.",
    actor: {
      name: "Devanshi Sharma",
      role: "Engineering Manager",
      avatar: "DS",
      color: "from-blue-600 to-indigo-600",
      email: "devanshi.sharma@worksync.io",
    },
    project: { id: "proj-4", name: "Enterprise Security Audit" },
    task: { id: "task-14", title: "Setup OAuth token rotation and session invalidation" },
    timestamp: "Yesterday at 11:30 AM",
    dateGroup: "Yesterday",
    isoTime: "2026-11-01T11:30:00Z",
    diff: {
      label: "Priority Changed",
      from: "Medium",
      to: "High",
      badgeColor: "rose",
    },
    starred: false,
  },
  {
    id: "act-210",
    category: "team_activity",
    actionType: "Member Joined",
    title: "Sneha Desai joined the workspace as QA Engineer",
    content: "Added to Engineering workspace and assigned to automated test suites for sprint burn-down calculations.",
    actor: {
      name: "Sneha Desai",
      role: "QA Engineer",
      avatar: "SD",
      color: "from-amber-500 to-orange-600",
      email: "sneha.desai@worksync.io",
    },
    project: { id: "proj-1", name: "WorkSync Web App" },
    timestamp: "Oct 31 at 10:00 AM",
    dateGroup: "Earlier This Week",
    isoTime: "2026-10-31T10:00:00Z",
    diff: {
      label: "Team Role",
      from: "Pending Invite",
      to: "Active QA Lead",
      badgeColor: "blue",
    },
    starred: false,
  },
  {
    id: "act-211",
    category: "task_update",
    actionType: "Task Completed",
    title: "Design light theme SaaS workspace layout and card tokens",
    content: "Completed UI design guidelines, responsive container layouts, and manager page templates.",
    actor: {
      name: "Aarav Patel",
      role: "UI/UX Designer",
      avatar: "AP",
      color: "from-pink-500 to-rose-600",
      email: "aarav.patel@worksync.io",
    },
    project: { id: "proj-1", name: "WorkSync Web App" },
    task: { id: "task-2", title: "Design light theme SaaS workspace layout and card tokens" },
    timestamp: "Oct 30 at 4:45 PM",
    dateGroup: "Earlier This Week",
    isoTime: "2026-10-30T16:45:00Z",
    diff: {
      label: "Status Changed",
      from: "In Progress",
      to: "Completed",
      badgeColor: "emerald",
    },
    starred: false,
  },
];
export default function ActivityPage() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active view tab: 'all' | 'task_updates' | 'comments' | 'team_activities'
  const [activeTab, setActiveTab] = useState("all");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [selectedActor, setSelectedActor] = useState("All Actors");
  const [selectedDateRange, setSelectedDateRange] = useState("all");

  // Quick Composer State
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState("comment"); // 'comment' | 'task_update'
  const [composerTask, setComposerTask] = useState("");
  const [composerText, setComposerText] = useState("");
  const [composerStatusTo, setComposerStatusTo] = useState("In Progress");

  // Inspect Modal State
  const [inspectItem, setInspectItem] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Real-time flash notification banner
  const [bannerNotice, setBannerNotice] = useState(null);

  const loadFeed = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError("");
    try {
      const [activityData, tasks, projects, teamData] = await Promise.all([
        managerService.getActivities({ page, limit: 20 }),
        managerService.getTasks(),
        managerService.getProjects(),
        managerService.getTeamMembers(),
      ]);
      if (!Array.isArray(activityData?.activities) || !activityData?.pagination) {
        throw new Error("The Manager API returned an invalid activity response.");
      }
      const taskMap = new Map(tasks.map((task) => [String(task.id || task._id), task]));
      const projectMap = new Map(projects.map((project) => [
        String(project.id || project._id),
        { id: project.id || project._id, name: project.name || project.title || "Project" },
      ]));
      const mappedFeed = activityData.activities.map((activity) => {
        const activityId = String(activity.id || activity._id);
        const entityId = String(activity.entityId || activity.metadata?.task || "");
        const task = taskMap.get(entityId) || null;
        const projectId = task?.project?.id || task?.project?._id || activity.metadata?.projectId;
        const rawProject = task?.project || projectMap.get(String(projectId)) || null;
        const createdAt = activity.createdAt ? new Date(activity.createdAt) : null;
        const ageInDays = createdAt && !Number.isNaN(createdAt.getTime())
          ? Math.floor((Date.now() - createdAt.getTime()) / 86400000)
          : Infinity;
        const action = String(activity.action || "ACTIVITY").replace(/_/g, " ");
        const isComment = action.toLowerCase().includes("comment");
        const user = activity.user || {};
        const actorName = user.name || "Workspace member";
        const actorAvatar = actorName.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
        return {
          id: activityId,
          category: isComment ? "comment" : activity.type === "task" ? "task_update" : "team_activity",
          actionType: action.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
          title: activity.entityName || task?.title || action,
          content: activity.details || activity.description || "",
          actor: {
            name: actorName,
            role: user.role || "Workspace member",
            avatar: actorAvatar || "?",
            color: "from-blue-600 to-indigo-600",
            email: user.email || "",
          },
          project: rawProject
            ? { id: rawProject.id || rawProject._id || projectId, name: rawProject.name || rawProject.title || "Project" }
            : null,
          task: task ? { id: task.id || task._id, title: task.title } : null,
          timestamp: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString() : "Time unavailable",
          dateGroup: ageInDays < 1 ? "Today" : ageInDays < 2 ? "Yesterday" : ageInDays < 7 ? "Earlier This Week" : "Last Week",
          isoTime: activity.createdAt || "",
          starred: false,
          likesCount: 0,
          hasLiked: false,
          replies: [],
        };
      });
      setFeed((current) => append ? [...current, ...mappedFeed] : mappedFeed);
      setTasksList(tasks.map((task) => ({
        ...task,
        id: task.id || task._id,
        projectId: task.project?.id || task.project?._id || "",
      })));
      setProjectsList(projects.map((project) => ({
        id: project.id || project._id,
        name: project.name || project.title || "Project",
      })));
      setTeamMembersList((teamData?.members || []).map((member) => ({
        id: member.id || member.memberId || member.userId,
        name: member.name || "Workspace member",
        avatar: member.name?.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?",
        color: "from-blue-600 to-indigo-600",
      })));
      setPagination(activityData.pagination);
      if (tasks.length) {
        setComposerTask((current) => current || String(tasks[0].id || tasks[0]._id));
      }
    } catch (loadError) {
      setError(loadError.message || "Unable to load activity feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Unique list of authors for dropdown
  const authorOptions = useMemo(() => {
    const list = Array.from(new Set(feed.map((item) => item.actor.name)));
    return ["All Actors", ...list];
  }, [feed]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = pagination.total || feed.length;
    const taskUpdatesCount = feed.filter((i) => i.category === "task_update").length;
    const commentsCount = feed.filter((i) => i.category === "comment").length;
    const teamActivitiesCount = feed.filter((i) => i.category === "team_activity").length;
    const totalReplies = feed
      .filter((i) => i.category === "comment")
      .reduce((acc, curr) => acc + (curr.replies?.length || 0), 0);

    return {
      total,
      taskUpdatesCount,
      commentsCount,
      teamActivitiesCount,
      totalDiscussions: commentsCount + totalReplies,
    };
  }, [feed, pagination.total]);

  // Filtered dataset
  const filteredFeed = useMemo(() => {
    return feed.filter((item) => {
      // 1. Tab filter
      if (activeTab === "task_updates" && item.category !== "task_update") return false;
      if (activeTab === "comments" && item.category !== "comment") return false;
      if (activeTab === "team_activities" && item.category !== "team_activity") return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesContent = item.content.toLowerCase().includes(q);
        const matchesActor = item.actor.name.toLowerCase().includes(q);
        const matchesProject = item.project?.name?.toLowerCase().includes(q);
        const matchesTask = item.task?.title?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent && !matchesActor && !matchesProject && !matchesTask) {
          return false;
        }
      }

      // 3. Project filter
      if (selectedProject !== "All Projects" && item.project?.name !== selectedProject) {
        return false;
      }

      // 4. Actor filter
      if (selectedActor !== "All Actors" && item.actor.name !== selectedActor) {
        return false;
      }

      // 6. Date Range filter
      if (selectedDateRange === "today" && item.dateGroup !== "Today") return false;
      if (selectedDateRange === "yesterday" && item.dateGroup !== "Yesterday") return false;
      if (selectedDateRange === "week" && item.dateGroup === "Last Week") return false;

      return true;
    });
  }, [feed, activeTab, searchQuery, selectedProject, selectedActor, selectedDateRange]);

  // Group by Date for timeline clarity
  const groupedFeed = useMemo(() => {
    const groups = {};
    filteredFeed.forEach((item) => {
      const groupKey = item.dateGroup || "Earlier";
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    return groups;
  }, [filteredFeed]);

  // Post New Activity / Comment from Composer
  const handlePostComposer = async (e) => {
    e.preventDefault();
    const chosenTask = tasksList.find((task) => String(task.id) === String(composerTask));
    if (!chosenTask) {
      setError("Select a task before posting.");
      return;
    }

    if (composerType === "comment" && !composerText.trim()) return;
    setMutationLoading(true);
    setError("");
    try {
      if (composerType === "comment") {
        await managerService.addTaskComment(chosenTask.id, composerText.trim());
      } else {
        const statusValues = {
          "To Do": "todo",
          "In Progress": "in_progress",
          "In Review": "review",
          Completed: "done",
        };
        await managerService.updateTaskStatus(chosenTask.id, statusValues[composerStatusTo]);
      }
      await loadFeed(1);
      setComposerText("");
      setComposerOpen(false);
      setBannerNotice(composerType === "comment" ? "Comment posted." : "Task status updated.");
      setTimeout(() => setBannerNotice(null), 3500);
    } catch (actionError) {
      setError(actionError.message || "Unable to update the selected task.");
    } finally {
      setMutationLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Activity ID", "Category", "Action", "Title", "Actor", "Role", "Project", "Task", "Timestamp", "Content"];
    const rows = filteredFeed.map((item) => [
      `"${item.id}"`,
      `"${item.category}"`,
      `"${item.actionType}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.actor.name}"`,
      `"${item.actor.role}"`,
      `"${item.project?.name || "N/A"}"`,
      `"${item.task?.title?.replace(/"/g, '""') || "N/A"}"`,
      `"${item.isoTime}"`,
      `"${item.content.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `worksync-activity-comments-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setSelectedProject("All Projects");
    setSelectedActor("All Actors");
    setSelectedDateRange("all");
  };

  // Copy Id to clipboard
  const handleCopyId = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Main Navigation Sidebar */}
      <Sidebar
        activeItem="activity"
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-w-0">
        {/* Global Manager Header with search and notifications */}
        <Header
          setMobileOpen={setMobileMenuOpen}
          pageTitle="Activity & Comments"
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          searchPlaceholder="Search task updates, team comments... (⌘K)"
        />

        {/* Live Event Notification Banner */}
        {bannerNotice && (
          <div className="bg-blue-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-md transition-all">
            <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{bannerNotice}</span>
            </div>
            <button onClick={() => setBannerNotice(null)} className="text-blue-100 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {error && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {/* Top Page Header (Matching team requirements: Activity & Comments) */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
                  <Activity size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                      Activity & Comments
                    </h1>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                      {filteredFeed.length} Items
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                    Recent task updates aur team activities across your active workspace.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => loadFeed()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                <span>{loading ? "Refreshing..." : "Refresh"}</span>
              </button>

              {/* Toggle Post Quick Comment / Update Composer */}
              <button
                type="button"
                onClick={() => setComposerOpen(!composerOpen)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                <Plus size={15} />
                <span>Post Comment / Update</span>
              </button>

              {/* Export Activity Log */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Recent Task Updates */}
            <div
              onClick={() => setActiveTab("task_updates")}
              className={`rounded-2xl border p-4.5 shadow-xs transition-all cursor-pointer ${
                activeTab === "task_updates"
                  ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Recent Task Updates</span>
                <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <ListTodo size={18} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.taskUpdatesCount}</span>
                <span className="text-xs font-medium text-emerald-600">Active status flow</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Status, assignments & priority</p>
            </div>

            {/* 2. Team Comments & Discussions */}
            <div
              onClick={() => setActiveTab("comments")}
              className={`rounded-2xl border p-4.5 shadow-xs transition-all cursor-pointer ${
                activeTab === "comments"
                  ? "border-violet-500 bg-violet-50/40 ring-2 ring-violet-500/20"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Comments & Discussions</span>
                <span className="rounded-lg bg-violet-50 p-2 text-violet-600">
                  <MessageSquare size={18} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.totalDiscussions}</span>
                <span className="text-xs font-medium text-violet-600">Threads active</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Team feedback & discussions</p>
            </div>

            {/* 3. Team Activities */}
            <div
              onClick={() => setActiveTab("team_activities")}
              className={`rounded-2xl border p-4.5 shadow-xs transition-all cursor-pointer ${
                activeTab === "team_activities"
                  ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Team Activities</span>
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <Users size={18} />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stats.teamActivitiesCount}</span>
                <span className="text-xs font-medium text-emerald-600">Milestones & reviews</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Member actions & sprint goals</p>
            </div>

            {/* 4. Active Contributors */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Participating Members</span>
                <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <Sparkles size={18} />
                </span>
              </div>
              <div className="mt-3 flex items-center -space-x-1.5 overflow-hidden">
                {teamMembersList.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    title={m.name}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${m.color} text-white text-[11px] font-bold ring-2 ring-white`}
                  >
                    {m.avatar}
                  </div>
                ))}
                {teamMembersList.length > 5 && (
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold ring-2 ring-white">
                    +{teamMembersList.length - 5}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">{teamMembersList.length} workspace members</p>
            </div>
          </section>

          {/* Quick Post / Comment Composer Drawer */}
          {composerOpen && (
            <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Send size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Post to Activity & Comments Feed
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Post a task comment or update a task status through the Manager API.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePostComposer} className="space-y-4">
                {/* Action Type & Target Task Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Action Type
                    </label>
                    <select
                      value={composerType}
                      onChange={(e) => setComposerType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="comment">Discussion Comment</option>
                      <option value="task_update">Task Status Update</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Target Task
                    </label>
                    <select
                      value={composerTask}
                      onChange={(e) => setComposerTask(e.target.value)}
                      disabled={tasksList.length === 0}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {tasksList.length === 0 && <option value="">No tasks available</option>}
                      {tasksList.map((t) => (
                        <option key={t.id} value={t.id}>
                          [{t.id.toUpperCase()}] {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* If task update, choose status */}
                {composerType === "task_update" && (
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-600">Update Status To:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {["To Do", "In Progress", "In Review", "Completed"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setComposerStatusTo(st)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            composerStatusTo === st
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Input Area */}
                {composerType === "comment" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Comment / Note Content
                    </label>
                    <textarea
                      rows={3}
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      placeholder="Write a comment on the selected task..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                )}

                {/* Submit Row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <AtSign size={13} />
                    <span>Comments attach to the selected task.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setComposerOpen(false)}
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={mutationLoading || !composerTask || (composerType === "comment" && !composerText.trim())}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      <Send size={13} />
                      <span>{mutationLoading ? "Saving..." : "Submit"}</span>
                    </button>
                  </div>
                </div>
              </form>
            </section>
          )}

          {/* Tab Navigation & Filtering Bar */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3.5">
            {/* Primary View Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                    activeTab === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Activity size={14} />
                  <span>All Activities</span>
                  <span className="ml-1 rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-white">
                    {feed.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("task_updates")}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                    activeTab === "task_updates"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <ListTodo size={14} />
                  <span>Recent Task Updates</span>
                  <span className="ml-1 rounded-full bg-blue-700 px-1.5 py-0.2 text-[10px] text-white">
                    {stats.taskUpdatesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("comments")}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                    activeTab === "comments"
                      ? "bg-violet-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <MessageSquare size={14} />
                  <span>Comments & Discussions</span>
                  <span className="ml-1 rounded-full bg-violet-700 px-1.5 py-0.2 text-[10px] text-white">
                    {stats.commentsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("team_activities")}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                    activeTab === "team_activities"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Users size={14} />
                  <span>Team Activities</span>
                  <span className="ml-1 rounded-full bg-emerald-700 px-1.5 py-0.2 text-[10px] text-white">
                    {stats.teamActivitiesCount}
                  </span>
                </button>
              </div>

            </div>

            {/* Dropdown Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              {/* Project Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Filter by Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="All Projects">All Projects</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actor Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Filter by Team Member
                </label>
                <select
                  value={selectedActor}
                  onChange={(e) => setSelectedActor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                >
                  {authorOptions.map((actor) => (
                    <option key={actor} value={actor}>
                      {actor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Time Range
                </label>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="all">All Recorded History</option>
                  <option value="today">Today Only</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Earlier This Week</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(activeTab !== "all" ||
              selectedProject !== "All Projects" ||
              selectedActor !== "All Actors" ||
              selectedDateRange !== "all" ||
              searchQuery) && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
                  <span className="font-semibold text-slate-700">Filters:</span>
                  {searchQuery && (
                    <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 font-medium border border-blue-100">
                      Query: "{searchQuery}"
                    </span>
                  )}
                  {activeTab !== "all" && (
                    <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 font-medium">
                      Tab: {activeTab.replace("_", " ")}
                    </span>
                  )}
                  {selectedProject !== "All Projects" && (
                    <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 font-medium">
                      Project: {selectedProject}
                    </span>
                  )}
                  {selectedActor !== "All Actors" && (
                    <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 font-medium">
                      Member: {selectedActor}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>

          {/* Timeline Feed Container */}
          <section className="space-y-6">
            {loading && feed.length === 0 ? (
              <div role="status" className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                Loading activity feed...
              </div>
            ) : Object.keys(groupedFeed).length === 0 || filteredFeed.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Activity size={28} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  No activities or comments match your filters
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or switching tabs to view recent task updates.
                </p>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                  >
                    <RefreshCw size={14} />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              </div>
            ) : (
              Object.entries(groupedFeed).map(([groupTitle, items]) => {
                if (!items || items.length === 0) return null;

                return (
                  <div key={groupTitle} className="space-y-3">
                    {/* Date Section Header */}
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-slate-200/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                        {groupTitle}
                      </span>
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-[11px] font-medium text-slate-400">
                        {items.length} {items.length === 1 ? "event" : "events"}
                      </span>
                    </div>

                    {/* Feed Item Cards */}
                    <div className="space-y-3">
                      {items.map((item) => {
                        const isComment = item.category === "comment";
                        const isTaskUpdate = item.category === "task_update";
                        const isTeamActivity = item.category === "team_activity";

                        return (
                          <div
                            key={item.id}
                            className={`group relative rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition-all ${
                              isComment
                                ? "border-slate-200/90 hover:border-violet-300"
                                : isTaskUpdate
                                ? "border-slate-200/90 hover:border-blue-300"
                                : "border-slate-200/90 hover:border-emerald-300"
                            } hover:shadow-md`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start gap-3.5">
                              {/* Left Actor Avatar */}
                              <div className="flex items-center gap-3 sm:block shrink-0">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.actor.color} text-white font-bold text-xs shadow-xs`}
                                >
                                  {item.actor.avatar}
                                </div>
                                <div className="sm:hidden flex items-center justify-between flex-1">
                                  <div>
                                    <span className="text-xs font-bold text-slate-900">
                                      {item.actor.name}
                                    </span>
                                    <p className="text-[10px] text-slate-400">{item.actor.role}</p>
                                  </div>
                                  <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                                </div>
                              </div>

                              {/* Main Card Content */}
                              <div className="flex-1 min-w-0 space-y-2">
                                {/* Header with Action Pill & Timestamp */}
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="hidden sm:inline-block text-xs font-bold text-slate-900">
                                        {item.actor.name}
                                      </span>
                                      <span className="hidden sm:inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                        {item.actor.role}
                                      </span>
                                      <span className="text-xs font-semibold text-slate-400">•</span>
                                      <span
                                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                                          isComment
                                            ? "bg-violet-50 text-violet-700 border-violet-200"
                                            : isTaskUpdate
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        }`}
                                      >
                                        {item.actionType}
                                      </span>
                                    </div>

                                    <h4 className="mt-1 text-sm font-semibold text-slate-900">
                                      {item.title}
                                    </h4>
                                  </div>

                                  {/* Right Star & Time */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
                                      {item.timestamp}
                                    </span>
                                  </div>
                                </div>

                                {/* Body Description / Comment Bubble */}
                                {isComment ? (
                                  <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-3.5 space-y-2">
                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                                      {String(item.content || "").split(" ").map((word, idx) =>
                                        word.startsWith("@") ? (
                                          <span
                                            key={idx}
                                            className="font-bold text-violet-700 bg-violet-100/80 px-1 py-0.5 rounded"
                                          >
                                            {word}{" "}
                                          </span>
                                        ) : (
                                          word + " "
                                        )
                                      )}
                                    </p>
                                    {item.task && (
                                      <Link
                                        to={`/manager/tasks/${item.task.id}`}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"
                                      >
                                        <MessageCircle size={13} />
                                        Open task discussion
                                      </Link>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {item.content}
                                  </p>
                                )}

                                {/* Visual State Diff Pill (for task updates & milestones) */}
                                {item.diff && (
                                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 py-1.5 text-xs">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                      {item.diff.label}:
                                    </span>
                                    <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                                      {item.diff.from}
                                    </span>
                                    <ArrowRight size={12} className="text-slate-400" />
                                    <span
                                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                                        item.diff.badgeColor === "emerald"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : item.diff.badgeColor === "rose"
                                          ? "bg-rose-50 text-rose-700 border-rose-200"
                                          : item.diff.badgeColor === "purple"
                                          ? "bg-purple-50 text-purple-700 border-purple-200"
                                          : "bg-blue-50 text-blue-700 border-blue-200"
                                      }`}
                                    >
                                      {item.diff.to}
                                    </span>
                                  </div>
                                )}

                                {/* Context Footer Tags & Deep Links */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {/* Project Pill */}
                                    {item.project && (
                                      <Link
                                        to={`/manager/projects/${item.project.id}`}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors"
                                      >
                                        <FolderKanban size={12} className="text-slate-500" />
                                        <span>{item.project.name}</span>
                                      </Link>
                                    )}

                                    {/* Task Link Pill */}
                                    {item.task && (
                                      <Link
                                        to={`/manager/tasks/${item.task.id}`}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 transition-colors"
                                      >
                                        <ListTodo size={12} className="text-blue-500" />
                                        <span>Task: {item.task.id.toUpperCase()}</span>
                                      </Link>
                                    )}
                                  </div>

                                  {/* Right Action: Inspect Details Modal Trigger */}
                                  <button
                                    type="button"
                                    onClick={() => setInspectItem(item)}
                                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                                  >
                                    <span>Audit details</span>
                                    <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
            {!loading && pagination.page < pagination.pages && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => loadFeed(pagination.page + 1, true)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Load more activities
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* 3. Detailed Audit Inspector Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Shield size={17} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Activity Audit Inspector</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Event ID: {inspectItem.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(inspectItem.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Copy Event ID"
                    >
                      {copiedId === inspectItem.id ? (
                        <Check size={12} className="text-emerald-600 inline" />
                      ) : (
                        <Copy size={12} className="inline" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                  {inspectItem.actionType}
                </span>
                <h4 className="mt-2 text-base font-bold text-slate-900">{inspectItem.title}</h4>
                <p className="mt-1 text-slate-600 leading-relaxed">{inspectItem.content}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Actor Info */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Initiated By
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${inspectItem.actor.color} text-white font-bold text-xs`}
                    >
                      {inspectItem.actor.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{inspectItem.actor.name}</p>
                      <p className="text-slate-500 text-[11px]">{inspectItem.actor.role}</p>
                      <p className="text-slate-400 text-[10px]">{inspectItem.actor.email}</p>
                    </div>
                  </div>
                </div>

                {/* Target Resource */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Target Resource
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">{inspectItem.project?.name || "Global"}</p>
                    {inspectItem.task && (
                      <p className="text-blue-600 font-medium truncate">
                        Task: {inspectItem.task.title}
                      </p>
                    )}
                    <p className="text-slate-400 text-[11px]">Recorded: {inspectItem.isoTime}</p>
                  </div>
                </div>
              </div>

              {/* Diff if present */}
              {inspectItem.diff && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    State Change: {inspectItem.diff.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-[10px] text-slate-400 font-semibold">Previous Value</p>
                      <p className="font-bold text-slate-700 mt-0.5">{inspectItem.diff.from}</p>
                    </div>
                    <ArrowRight size={15} className="text-slate-400" />
                    <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50/60 p-2">
                      <p className="text-[10px] text-blue-500 font-semibold">Updated Value</p>
                      <p className="font-bold text-blue-700 mt-0.5">{inspectItem.diff.to}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
              <div className="flex items-center gap-2">
                {inspectItem.task && (
                  <Link
                    to={`/manager/tasks/${inspectItem.task.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <ListTodo size={13} />
                    <span>View Task</span>
                  </Link>
                )}
                {inspectItem.project && (
                  <Link
                    to={`/manager/projects/${inspectItem.project.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <FolderKanban size={13} />
                    <span>View Project</span>
                  </Link>
                )}
              </div>

              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
