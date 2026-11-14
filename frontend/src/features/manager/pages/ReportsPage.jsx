import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Printer,
  Share2,
  Filter,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Users,
  FolderKanban,
  ListTodo,
  ChevronDown,
  Search,
  X,
  RefreshCw,
  FileText,
  Check,
  Eye,
  Info,
  Layers,
  Zap,
  ShieldCheck,
  Target,
  Activity,
  SlidersHorizontal,
} from "lucide-react";
import Sidebar from "../../../components/layout/Sidebar.jsx";
import Header from "../../../components/layout/Header.jsx";
import managerService from "../managerService.js";

// ==========================================
// DATASETS & BENCHMARKS
// ==========================================

const sprintVelocityData = [
  { sprint: "Sprint 1", planned: 30, completed: 24, velocity: 24, rate: 80, dates: "Sep 02 - Sep 16" },
  { sprint: "Sprint 2", planned: 35, completed: 28, velocity: 28, rate: 80, dates: "Sep 16 - Sep 30" },
  { sprint: "Sprint 3", planned: 38, completed: 31, velocity: 31, rate: 81.5, dates: "Sep 30 - Oct 14" },
  { sprint: "Sprint 4 (Active)", planned: 42, completed: 34, velocity: 34, rate: 81.0, dates: "Oct 14 - Oct 28", current: true },
];

const burndownDays = [
  { day: "Day 1", ideal: 42, actual: 42 },
  { day: "Day 2", ideal: 37.8, actual: 41 },
  { day: "Day 3", ideal: 33.6, actual: 38 },
  { day: "Day 4", ideal: 29.4, actual: 32 },
  { day: "Day 5", ideal: 25.2, actual: 26 },
  { day: "Day 6", ideal: 21.0, actual: 21 },
  { day: "Day 7", ideal: 16.8, actual: 17 },
  { day: "Day 8", ideal: 12.6, actual: 12 },
  { day: "Day 9", ideal: 8.4, actual: 8 },
  { day: "Day 10", ideal: 4.2, actual: null },
  { day: "Day 11", ideal: 0, actual: null },
];

const projectsReport = [
  {
    id: "proj-1",
    name: "WorkSync Web App",
    category: "Core Platform",
    progress: 72,
    totalTasks: 25,
    completedTasks: 18,
    inProgressTasks: 5,
    blockedTasks: 2,
    velocity: 16,
    budgetHours: 240,
    loggedHours: 182,
    status: "On Track",
    statusBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    lead: "Devanshi Sharma",
  },
  {
    id: "proj-2",
    name: "Mobile Companion App",
    category: "Mobile",
    progress: 45,
    totalTasks: 20,
    completedTasks: 9,
    inProgressTasks: 7,
    blockedTasks: 4,
    velocity: 8,
    budgetHours: 200,
    loggedHours: 110,
    status: "At Risk",
    statusBadge: "bg-rose-50 text-rose-700 border-rose-200",
    lead: "Vikram Malhotra",
  },
  {
    id: "proj-3",
    name: "Real-Time Sync Engine",
    category: "Infrastructure",
    progress: 85,
    totalTasks: 14,
    completedTasks: 12,
    inProgressTasks: 2,
    blockedTasks: 0,
    velocity: 12,
    budgetHours: 150,
    loggedHours: 128,
    status: "Ahead",
    statusBadge: "bg-blue-50 text-blue-700 border-blue-200",
    lead: "Ayan Mukherjee",
  },
  {
    id: "proj-4",
    name: "Enterprise Security Audit",
    category: "Security",
    progress: 100,
    totalTasks: 16,
    completedTasks: 16,
    inProgressTasks: 0,
    blockedTasks: 0,
    velocity: 14,
    budgetHours: 120,
    loggedHours: 116,
    status: "Completed",
    statusBadge: "bg-slate-100 text-slate-700 border-slate-200",
    lead: "Devanshi Sharma",
  },
  {
    id: "proj-5",
    name: "Client Onboarding Portal",
    category: "Product",
    progress: 30,
    totalTasks: 10,
    completedTasks: 3,
    inProgressTasks: 3,
    blockedTasks: 4,
    velocity: 4,
    budgetHours: 90,
    loggedHours: 32,
    status: "On Hold",
    statusBadge: "bg-amber-50 text-amber-700 border-amber-200",
    lead: "Rouhan Siddiqui",
  },
  {
    id: "proj-6",
    name: "Analytics & Reporting Hub",
    category: "Internal Tooling",
    progress: 65,
    totalTasks: 20,
    completedTasks: 13,
    inProgressTasks: 5,
    blockedTasks: 2,
    velocity: 11,
    budgetHours: 160,
    loggedHours: 104,
    status: "On Track",
    statusBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    lead: "Amit Verma",
  },
];

const teamPerformanceReport = [
  {
    id: "tm-1",
    name: "Devanshi Sharma",
    role: "Engineering Manager",
    dept: "Engineering",
    avatar: "DS",
    color: "from-blue-600 to-indigo-600",
    assigned: 4,
    completed: 3,
    inProgress: 1,
    storyPoints: 12,
    efficiency: 94,
    hoursLogged: 36.5,
    capacity: 70,
    status: "Optimal",
  },
  {
    id: "tm-2",
    name: "Ayan Mukherjee",
    role: "Fullstack Admin",
    dept: "Engineering",
    avatar: "AM",
    color: "from-cyan-500 to-blue-600",
    assigned: 6,
    completed: 5,
    inProgress: 1,
    storyPoints: 18,
    efficiency: 96,
    hoursLogged: 42.0,
    capacity: 92,
    status: "Heavy Load",
  },
  {
    id: "tm-3",
    name: "Rouhan Siddiqui",
    role: "Frontend Dev",
    dept: "Engineering",
    avatar: "RS",
    color: "from-emerald-500 to-teal-600",
    assigned: 5,
    completed: 4,
    inProgress: 1,
    storyPoints: 14,
    efficiency: 89,
    hoursLogged: 38.0,
    capacity: 78,
    status: "Optimal",
  },
  {
    id: "tm-4",
    name: "Priya Patel",
    role: "UI Designer",
    dept: "Product & Design",
    avatar: "PP",
    color: "from-violet-500 to-purple-600",
    assigned: 4,
    completed: 3,
    inProgress: 1,
    storyPoints: 10,
    efficiency: 92,
    hoursLogged: 32.0,
    capacity: 65,
    status: "Available",
  },
  {
    id: "tm-5",
    name: "Vikram Malhotra",
    role: "Mobile Engineer",
    dept: "Mobile",
    avatar: "VM",
    color: "from-amber-500 to-orange-600",
    assigned: 5,
    completed: 2,
    inProgress: 2,
    storyPoints: 15,
    efficiency: 72,
    hoursLogged: 39.0,
    capacity: 88,
    status: "Attention",
  },
  {
    id: "tm-6",
    name: "Sneha Desai",
    role: "QA Lead",
    dept: "Quality Assurance",
    avatar: "SD",
    color: "from-rose-500 to-pink-600",
    assigned: 6,
    completed: 5,
    inProgress: 1,
    storyPoints: 16,
    efficiency: 95,
    hoursLogged: 37.5,
    capacity: 75,
    status: "Optimal",
  },
  {
    id: "tm-7",
    name: "Amit Verma",
    role: "Backend Developer",
    dept: "Engineering",
    avatar: "AV",
    color: "from-teal-500 to-emerald-600",
    assigned: 5,
    completed: 4,
    inProgress: 1,
    storyPoints: 15,
    efficiency: 88,
    hoursLogged: 40.0,
    capacity: 82,
    status: "Optimal",
  },
  {
    id: "tm-8",
    name: "Karan Mehta",
    role: "Frontend Developer",
    dept: "Engineering",
    avatar: "KM",
    color: "from-indigo-500 to-blue-600",
    assigned: 4,
    completed: 3,
    inProgress: 1,
    storyPoints: 11,
    efficiency: 86,
    hoursLogged: 33.0,
    capacity: 68,
    status: "Available",
  },
];

const deliverablesList = [
  {
    id: "task-101",
    title: "Implement WebSocket connection and live presence sync",
    project: "WorkSync Web App",
    projectId: "proj-1",
    assignee: "Ayan Mukherjee",
    role: "Fullstack Admin",
    avatar: "AM",
    priority: "High",
    status: "Completed",
    cycleTime: "2.4 days",
    estHours: 24,
    actualHours: 21,
    dueDate: "Oct 18, 2026",
    health: "On Time",
    category: "Backend",
  },
  {
    id: "task-102",
    title: "Design light theme SaaS workspace layout and card tokens",
    project: "WorkSync Web App",
    projectId: "proj-1",
    assignee: "Priya Patel",
    role: "UI Designer",
    avatar: "PP",
    priority: "Medium",
    status: "Completed",
    cycleTime: "3.1 days",
    estHours: 16,
    actualHours: 15,
    dueDate: "Oct 20, 2026",
    health: "On Time",
    category: "Design",
  },
  {
    id: "task-103",
    title: "Build Kanban board column state and status transition handlers",
    project: "WorkSync Web App",
    projectId: "proj-1",
    assignee: "Rouhan Siddiqui",
    role: "Frontend Dev",
    avatar: "RS",
    priority: "High",
    status: "In Progress",
    cycleTime: "Ongoing",
    estHours: 20,
    actualHours: 14,
    dueDate: "Oct 26, 2026",
    health: "On Track",
    category: "Frontend",
  },
  {
    id: "task-104",
    title: "Configure role-based access control and manager route guards",
    project: "WorkSync Web App",
    projectId: "proj-1",
    assignee: "Devanshi Sharma",
    role: "Engineering Manager",
    avatar: "DS",
    priority: "High",
    status: "Completed",
    cycleTime: "1.8 days",
    estHours: 18,
    actualHours: 16,
    dueDate: "Oct 22, 2026",
    health: "Ahead",
    category: "Security",
  },
  {
    id: "task-105",
    title: "Push notifications service for iOS background task updates",
    project: "Mobile Companion App",
    projectId: "proj-2",
    assignee: "Vikram Malhotra",
    role: "Mobile Engineer",
    avatar: "VM",
    priority: "High",
    status: "In Progress",
    cycleTime: "Ongoing",
    estHours: 28,
    actualHours: 26,
    dueDate: "Oct 27, 2026",
    health: "At Risk",
    category: "Mobile",
  },
  {
    id: "task-106",
    title: "Offline SQLite database caching and optimistic UI reconciliation",
    project: "Mobile Companion App",
    projectId: "proj-2",
    assignee: "Vikram Malhotra",
    role: "Mobile Engineer",
    avatar: "VM",
    priority: "Medium",
    status: "In Review",
    cycleTime: "4.2 days",
    estHours: 22,
    actualHours: 25,
    dueDate: "Oct 24, 2026",
    health: "1d Delayed",
    category: "Mobile",
  },
  {
    id: "task-107",
    title: "Automated test suite for sprint burndown calculations",
    project: "Real-Time Sync Engine",
    projectId: "proj-3",
    assignee: "Sneha Desai",
    role: "QA Lead",
    avatar: "SD",
    priority: "Medium",
    status: "Completed",
    cycleTime: "2.0 days",
    estHours: 14,
    actualHours: 12,
    dueDate: "Oct 21, 2026",
    health: "Ahead",
    category: "QA",
  },
  {
    id: "task-108",
    title: "High-concurrency Redis lock coordinator for multi-tab edits",
    project: "Real-Time Sync Engine",
    projectId: "proj-3",
    assignee: "Amit Verma",
    role: "Backend Developer",
    avatar: "AV",
    priority: "High",
    status: "Completed",
    cycleTime: "3.5 days",
    estHours: 26,
    actualHours: 24,
    dueDate: "Oct 23, 2026",
    health: "On Time",
    category: "Backend",
  },
  {
    id: "task-109",
    title: "SOC2 compliance audit checklist verification & log export",
    project: "Enterprise Security Audit",
    projectId: "proj-4",
    assignee: "Devanshi Sharma",
    role: "Engineering Manager",
    avatar: "DS",
    priority: "High",
    status: "Completed",
    cycleTime: "1.5 days",
    estHours: 16,
    actualHours: 14,
    dueDate: "Oct 15, 2026",
    health: "Completed",
    category: "Security",
  },
  {
    id: "task-110",
    title: "Client portal onboarding wizard steps and validation schema",
    project: "Client Onboarding Portal",
    projectId: "proj-5",
    assignee: "Karan Mehta",
    role: "Frontend Developer",
    avatar: "KM",
    priority: "Medium",
    status: "In Progress",
    cycleTime: "Ongoing",
    estHours: 18,
    actualHours: 12,
    dueDate: "Oct 29, 2026",
    health: "On Track",
    category: "Frontend",
  },
  {
    id: "task-111",
    title: "Interactive reports filter controls and CSV export engine",
    project: "Analytics & Reporting Hub",
    projectId: "proj-6",
    assignee: "Rouhan Siddiqui",
    role: "Frontend Dev",
    avatar: "RS",
    priority: "High",
    status: "Completed",
    cycleTime: "2.1 days",
    estHours: 20,
    actualHours: 18,
    dueDate: "Oct 25, 2026",
    health: "Ahead",
    category: "Frontend",
  },
  {
    id: "task-112",
    title: "End-to-end regression testing on cross-browser chart rendering",
    project: "Analytics & Reporting Hub",
    projectId: "proj-6",
    assignee: "Sneha Desai",
    role: "QA Lead",
    avatar: "SD",
    priority: "Medium",
    status: "Completed",
    cycleTime: "1.9 days",
    estHours: 12,
    actualHours: 11,
    dueDate: "Oct 26, 2026",
    health: "On Time",
    category: "QA",
  },
];

// Priority and status color styles
const priorityStyles = {
  High: "bg-rose-50 text-rose-700 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Urgent: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusStyles = {
  "To Do": "bg-slate-100 text-slate-700 border-slate-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  "In Review": "bg-purple-50 text-purple-700 border-purple-200",
  "At Risk": "bg-rose-50 text-rose-700 border-rose-200",
};

const getTaskStatusLabel = (status) => ({
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Completed",
}[String(status || "").toLowerCase()] || "To Do");

const getInitials = (name) =>
  String(name || "?").trim().split(/\s+/).slice(0, 2)
    .map((part) => part.charAt(0)).join("").toUpperCase() || "?";

const formatReportDate = (date) => {
  if (!date) return "No due date";
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? "No due date"
    : parsedDate.toLocaleDateString();
};

const getProjectStatusBadge = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();
  if (normalizedStatus === "completed") return "bg-slate-100 text-slate-700 border-slate-200";
  if (normalizedStatus === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalizedStatus === "planning") return "bg-blue-50 text-blue-700 border-blue-200";
  if (normalizedStatus === "on_hold") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

// ==========================================
// MAIN REPORTS PAGE COMPONENT
// ==========================================

const ReportsPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("Workspace overview");
  const [selectedProject, setSelectedProject] = useState("All Projects");
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'velocity', 'team', 'deliverables'
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState("");
  const [reportsOverview, setReportsOverview] = useState(null);
  const [projectsReport, setProjectsReport] = useState([]);
  const [teamPerformanceReport, setTeamPerformanceReport] = useState([]);
  const [deliverablesList, setDeliverablesList] = useState([]);
  const [sprintVelocityData, setSprintVelocityData] = useState([]);
  const [burndownDays, setBurndownDays] = useState([]);
  const [workloadSummary, setWorkloadSummary] = useState(null);
  const [taskReports, setTaskReports] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [hoveredVelocitySprint, setHoveredVelocitySprint] = useState(null);
  const [hoveredBurndownDay, setHoveredBurndownDay] = useState(null);
  const [selectedTaskModal, setSelectedTaskModal] = useState(null);

  const loadReports = useCallback(async () => {
    setReportLoading(true);
    setReportError("");
    try {
      const [
        overviewResponse,
        projectResponse,
        taskResponse,
        performanceResponse,
        workloadResponse,
        productivityResponse,
        burndownResponse,
        tasksResponse,
      ] = await Promise.all([
        managerService.getReportsOverview(),
        managerService.getProjectReports(),
        managerService.getTaskReports(),
        managerService.getTeamPerformanceReports(),
        managerService.getWorkloadReports(),
        managerService.getProductivityReports(),
        managerService.getBurndownReports(),
        managerService.getTasks(),
      ]);

      const overview = overviewResponse?.overview || {};
      const reportWorkloads = Array.isArray(workloadResponse?.distribution)
        ? workloadResponse.distribution
        : [];
      const averageLoadPercentage = reportWorkloads.length
        ? Math.round(reportWorkloads.reduce(
          (sum, member) => sum + (Number(member.loadPercentage) || 0),
          0
        ) / reportWorkloads.length)
        : 0;
      const workloadByMember = new Map(
        reportWorkloads.map((member) => [member.memberId, member])
      );

      setReportsOverview(overview);
      setTaskReports(taskResponse);
      setWorkloadSummary({
        teamSize: reportWorkloads.length,
        averageLoadPercentage,
        overloadedMembers: Number(workloadResponse?.summary?.overloadedMembers) || 0,
      });
      setProjectsReport(projectResponse.map((project) => ({
        id: project.id,
        name: project.name || project.title || "Untitled project",
        category: project.key || "Project",
        lead: project.owner?.name || "Not assigned",
        status: String(project.status || "unknown")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase()),
        statusBadge: getProjectStatusBadge(project.status),
        progress: Number(project.progress) || 0,
        completedTasks: Number(project.completedTasks) || 0,
        totalTasks: Number(project.totalTasks) || 0,
        overdueTasks: Number(project.overdueTasks) || 0,
      })));
      setTeamPerformanceReport(performanceResponse.map((member) => {
        const workload = workloadByMember.get(member.memberId);
        const capacityStatus = workload?.status || "available";
        return {
          id: member.memberId,
          name: member.name || "Unknown member",
          role: member.workspaceRole || "Member",
          avatar: getInitials(member.name),
          color: "from-blue-600 to-indigo-600",
          completed: Number(member.completedTasks) || 0,
          totalTasks: Number(member.totalTasks) || 0,
          efficiency: Number(member.efficiencyScore) || 0,
          capacity: Number(workload?.loadPercentage) || 0,
          status: capacityStatus === "overloaded"
            ? "Overloaded"
            : capacityStatus === "busy"
              ? "Busy"
              : capacityStatus === "moderate"
                ? "Moderate"
                : "Available",
        };
      }));
      setDeliverablesList(tasksResponse.map((task) => {
        const isOverdue = task.dueDate &&
          new Date(task.dueDate).getTime() < Date.now() &&
          task.status !== "done";
        return {
          id: task.id,
          title: task.title || "Untitled task",
          project: task.project?.name || "No project",
          projectId: task.project?.id || "",
          assignee: task.assignee?.name || "Unassigned",
          role: "Not provided",
          avatar: getInitials(task.assignee?.name || "Unassigned"),
          priority: String(task.priority || "medium")
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
          status: getTaskStatusLabel(task.status),
          dueDate: formatReportDate(task.dueDate),
          health: isOverdue ? "Overdue" : "On Track",
          category: task.project?.key || "Task",
        };
      }));
      setSprintVelocityData(productivityResponse.map((week) => ({
        sprint: week.weekLabel,
        dates: `${week.startDate} - ${week.endDate}`,
        planned: Number(week.tasksCreated) || 0,
        completed: Number(week.tasksCompleted) || 0,
        rate: Math.round((Number(week.throughputRatio) || 0) * 100),
        current: week.weekLabel === "Week -0",
      })));
      setBurndownDays((Array.isArray(burndownResponse?.burndownPoints)
        ? burndownResponse.burndownPoints
        : []).map((point) => ({
        day: point.day,
        ideal: Number(point.idealRemaining) || 0,
        actual: Number(point.actualRemaining) || 0,
      })));
      return true;
    } catch (error) {
      setReportError(error.message || "Unable to load manager reports.");
      return false;
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Show auto-dismissing toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const refreshed = await loadReports();
    setIsRefreshing(false);
    triggerToast(refreshed
      ? "Workspace reports refreshed successfully."
      : "Unable to refresh reports. Check the error message on this page.");
  };

  const handleExportCSV = async () => {
    setExportMenuOpen(false);
    try {
      const report = await managerService.getReportsExport();
      const url = URL.createObjectURL(new Blob([report.content], { type: report.contentType || "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = report.filename || "worksync-report.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      triggerToast("CSV report downloaded successfully.");
    } catch (error) {
      triggerToast(error.message || "Unable to export the reports.");
    }
  };

  // Print view
  const handlePrint = () => {
    setExportMenuOpen(false);
    window.print();
  };

  // Share summary
  const handleShare = () => {
    setExportMenuOpen(false);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Reports dashboard link copied to clipboard!");
    } else {
      triggerToast("Link ready: " + window.location.href);
    }
  };

  // Filter deliverables table
  const filteredDeliverables = useMemo(() => {
    return deliverablesList.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.assignee.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.project.toLowerCase().includes(tableSearch.toLowerCase());

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesProject = selectedProject === "All Projects" || item.project === selectedProject;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [deliverablesList, tableSearch, statusFilter, selectedProject]);

  // Aggregate metrics
  const taskStatusBreakdown = taskReports?.statusBreakdown || {};
  const totalTasksCount = Number(taskReports?.totalTasks ?? deliverablesList.length);
  const completedTasksCount = Number(taskStatusBreakdown.done ?? deliverablesList.filter((t) => t.status === "Completed").length);
  const inProgressTasksCount = Number(taskStatusBreakdown.in_progress ?? deliverablesList.filter((t) => t.status === "In Progress").length);
  const inReviewTasksCount = Number(taskStatusBreakdown.review ?? deliverablesList.filter((t) => t.status === "In Review").length);
  const todoTasksCount = Number(taskStatusBreakdown.todo ?? deliverablesList.filter((t) => t.status === "To Do").length);
  const atRiskTasksCount = deliverablesList.filter((t) => t.health === "Overdue").length;
  const completedPercent = totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const inProgressPercent = totalTasksCount ? Math.round((inProgressTasksCount / totalTasksCount) * 100) : 0;
  const inReviewPercent = totalTasksCount ? Math.round((inReviewTasksCount / totalTasksCount) * 100) : 0;
  const todoPercent = totalTasksCount ? Math.round((todoTasksCount / totalTasksCount) * 100) : 0;
  const reportTaskStats = reportsOverview?.tasks || {};

  const completionPercentage = totalTasksCount
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  // SVG dimensions for Burndown Chart
  const burndownWidth = 540;
  const burndownHeight = 200;
  const burndownPadding = { top: 20, right: 30, bottom: 30, left: 35 };

  const burndownPlotWidth = burndownWidth - burndownPadding.left - burndownPadding.right;
  const burndownPlotHeight = burndownHeight - burndownPadding.top - burndownPadding.bottom;

  const maxPoints = Math.max(1, ...burndownDays.map((day) => day.ideal));
  const burndownGridValues = [...new Set([0, 0.25, 0.5, 0.75, 1]
    .map((fraction) => Math.round(maxPoints * fraction)))];
  const getX = (idx, total) => burndownPadding.left + (idx / (total - 1)) * burndownPlotWidth;
  const getY = (val) => burndownPadding.top + (1 - val / maxPoints) * burndownPlotHeight;

  // Ideal path string
  const idealPath = burndownDays
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i, burndownDays.length)} ${getY(d.ideal)}`)
    .join(" ");

  // Actual points (up to Day 9)
  const actualDaysWithData = burndownDays.filter((d) => d.actual !== null);
  const actualPath = actualDaysWithData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i, burndownDays.length)} ${getY(d.actual)}`)
    .join(" ");

  // Area path for actual line gradient
  const actualAreaPath = actualDaysWithData.length > 0
    ? `${actualPath} L ${getX(actualDaysWithData.length - 1, burndownDays.length)} ${getY(0)} L ${getX(0, burndownDays.length)} ${getY(0)} Z`
    : "";

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans text-slate-800 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Check size={14} />
          </div>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  {selectedTaskModal.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedTaskModal.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedTaskModal.project}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3.5 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assignee</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-bold text-white">
                    {selectedTaskModal.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{selectedTaskModal.assignee}</p>
                    <p className="text-[10px] text-slate-500">{selectedTaskModal.role}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status & Priority</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${statusStyles[selectedTaskModal.status] || "bg-slate-100"}`}>
                    {selectedTaskModal.status}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${priorityStyles[selectedTaskModal.priority] || "bg-slate-100"}`}>
                    {selectedTaskModal.priority}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selectedTaskModal.project}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Due Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selectedTaskModal.dueDate}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
              <p className="text-xs font-semibold text-slate-800">Task details</p>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                {selectedTaskModal.health === "Overdue"
                  ? "This task is past its due date and is not marked complete."
                  : "Task information is based on the current workspace task record."}
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTaskModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Persistent Sidebar */}
      <Sidebar activeItem="reports" mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64 xl:pl-72">
        {/* Shared Top Navigation Header */}
        <Header
          setMobileOpen={setMobileOpen}
          pageTitle="Reports & Analytics"
          breadcrumbs={[
            { label: "Insights", href: "/manager/reports" },
            { label: "Reports & Analytics" },
          ]}
        />

        {/* Main Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {reportError && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {reportError}
            </div>
          )}
          {reportLoading && (
            <p className="text-sm text-slate-500" role="status">Loading workspace reports...</p>
          )}
          {/* Top Title & Executive Action Bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                  Workspace Metrics
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Data Engine
                </span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Reports & Performance Analytics
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Project progress, task status, workload, and weekly productivity from your workspace.
              </p>
            </div>

            {/* Filter Dropdowns and Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Reporting scope */}
              <div className="relative">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                >
                  <option value="Workspace overview">All workspace data</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh metrics"
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
              >
                <RefreshCw size={15} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition active:scale-[0.98]"
                >
                  <Download size={14} />
                  <span>Export Report</span>
                  <ChevronDown size={13} className="opacity-80" />
                </button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-30">
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      <FileText size={15} className="text-blue-600" />
                      <span>Download CSV Data</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      <Printer size={15} className="text-slate-500" />
                      <span>Print / PDF Summary</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      <Share2 size={15} className="text-slate-500" />
                      <span>Copy Share Link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workspace summary */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Workspace report summary</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-3xl">
                    The workspace has <strong>{reportTaskStats.total ?? 0} tasks</strong>, with{" "}
                    <strong>{reportTaskStats.completed ?? 0} completed</strong> and{" "}
                    <strong>{reportTaskStats.overdue ?? 0} overdue</strong>. There are{" "}
                    <strong>{reportsOverview?.projects?.active ?? 0} active projects</strong> across{" "}
                    <strong>{reportsOverview?.team?.totalMembers ?? 0} members</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top 4 KPI Metric Summary Cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Velocity & Completion */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Task Completion
                  </p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {reportTaskStats.completionRate ?? completionPercentage}%
                  </p>
                </div>
                <div className="rounded-xl p-2.5 bg-blue-50 text-blue-600 border border-blue-100">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="mt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">{reportTaskStats.completed ?? completedTasksCount} of {reportTaskStats.total ?? totalTasksCount} tasks</span>
                  <span className="font-bold text-slate-500">
                    {reportTaskStats.overdue ?? atRiskTasksCount} overdue
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${reportTaskStats.completionRate ?? completionPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Card 2: Average Lead & Cycle Time */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Overdue Tasks
                  </p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {reportTaskStats.overdue ?? atRiskTasksCount}
                  </p>
                </div>
                <div className="rounded-xl p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Clock3 size={20} />
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Tasks past their due date</span>
                <span className="font-semibold text-slate-600">{reportTaskStats.overdueRate ?? 0}% of tasks</span>
              </div>
            </div>

            {/* Card 3: Milestone Delivery Health */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Completed Projects
                  </p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {reportsOverview?.projects?.completed ?? 0}
                  </p>
                </div>
                <div className="rounded-xl p-2.5 bg-purple-50 text-purple-600 border border-purple-100">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>of {reportsOverview?.projects?.total ?? 0} projects</span>
                <span className="font-semibold text-purple-700">{reportsOverview?.projects?.active ?? 0} active</span>
              </div>
            </div>

            {/* Card 4: Workload Capacity & Bottlenecks */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Team Utilization
                  </p>
                  <p className="mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {workloadSummary?.averageLoadPercentage ?? 0}%
                  </p>
                </div>
                <div className="rounded-xl p-2.5 bg-amber-50 text-amber-600 border border-amber-100">
                  <Activity size={20} />
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>{workloadSummary?.teamSize ?? 0} team members</span>
                <span className="font-semibold text-amber-700">{workloadSummary?.overloadedMembers ?? 0} overloaded</span>
              </div>
            </div>
          </section>

          {/* Navigation View Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "overview"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <BarChart3 size={15} />
              <span>Executive Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("velocity")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "velocity"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <Zap size={15} />
              <span>Weekly Productivity & Burndown</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "team"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <Users size={15} />
              <span>Team Capacity & Output</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("deliverables")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "deliverables"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <ListTodo size={15} />
              <span>Deliverables Audit ({filteredDeliverables.length})</span>
            </button>
          </div>

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Row 1: Interactive Charts (Burndown Curve & Status Donut) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Sprint Burndown Chart (2 cols) */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">Workspace Task Burndown</h3>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                          {burndownDays.length} days
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Remaining tasks compared with the ideal workspace trend.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-4 border-b-2 border-dashed border-slate-400"></span>
                        <span className="text-slate-500 text-[11px]">Ideal Guideline</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                        <span className="font-semibold text-slate-700 text-[11px]">Actual Pts</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Burndown Graph */}
                  <div className="mt-4 relative">
                    <svg viewBox={`0 0 ${burndownWidth} ${burndownHeight}`} className="w-full h-48 sm:h-56 select-none overflow-visible">
                      <defs>
                        <linearGradient id="burndownGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      {burndownGridValues.map((val) => (
                        <g key={val}>
                          <line
                            x1={burndownPadding.left}
                            y1={getY(val)}
                            x2={burndownWidth - burndownPadding.right}
                            y2={getY(val)}
                            stroke="#f1f5f9"
                            strokeWidth="1"
                          />
                          <text
                            x={burndownPadding.left - 8}
                            y={getY(val) + 3}
                            textAnchor="end"
                            fontSize="9"
                            fill="#94a3b8"
                            fontWeight="600"
                          >
                            {val} tasks
                          </text>
                        </g>
                      ))}

                      {/* Ideal trajectory dashed line */}
                      <path
                        d={idealPath}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />

                      {/* Actual area gradient fill */}
                      <path d={actualAreaPath} fill="url(#burndownGrad)" />

                      {/* Actual trajectory solid line */}
                      <path
                        d={actualPath}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Point Dots */}
                      {actualDaysWithData.map((d, i) => {
                        const cx = getX(i, burndownDays.length);
                        const cy = getY(d.actual);
                        const isHovered = hoveredBurndownDay === i;

                        return (
                          <g
                            key={d.day}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredBurndownDay(i)}
                            onMouseLeave={() => setHoveredBurndownDay(null)}
                          >
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isHovered ? 6 : 4}
                              fill="#ffffff"
                              stroke="#2563eb"
                              strokeWidth={isHovered ? 3 : 2}
                              className="transition-all duration-150"
                            />
                            {/* X-axis labels */}
                            <text
                              x={cx}
                              y={burndownHeight - 8}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#64748b"
                              fontWeight={isHovered ? "700" : "500"}
                            >
                              D{i + 1}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Hover Info Tooltip Badge */}
                    {hoveredBurndownDay !== null && (
                      <div className="absolute top-2 right-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-xs text-xs">
                        <span className="font-bold text-slate-800">
                          {burndownDays[hoveredBurndownDay].day}:
                        </span>{" "}
                        <span className="text-blue-600 font-extrabold">
                          {burndownDays[hoveredBurndownDay].actual} tasks remaining
                        </span>{" "}
                        <span className="text-slate-400 text-[10px]">
                          (Ideal: {burndownDays[hoveredBurndownDay].ideal.toFixed(1)} tasks)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      Total task scope: <strong>{Math.max(0, ...burndownDays.map((day) => day.ideal))}</strong>
                    </span>
                    <span>Remaining tasks: <strong>{burndownDays[burndownDays.length - 1]?.actual ?? 0}</strong></span>
                  </div>
                </div>

                {/* Task Status Radial / Donut Distribution (1 col) */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="pb-3 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900">Task Status Distribution</h3>
                      <p className="mt-0.5 text-xs text-slate-500">All deliverables in current sprint</p>
                    </div>

                    {/* Donut representation using clean CSS and SVG */}
                    <div className="mt-4 flex items-center justify-center">
                      <div className="relative flex items-center justify-center">
                        <svg className="h-40 w-40 -rotate-90 transform">
                          {/* Background ring */}
                          <circle
                            cx="80"
                            cy="80"
                            r="62"
                            fill="transparent"
                            stroke="#f1f5f9"
                            strokeWidth="18"
                          />
                          {/* Completed tasks */}
                          <circle
                            cx="80"
                            cy="80"
                            r="62"
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="18"
                            strokeDasharray={`${(completedPercent / 100) * 390} 390`}
                            strokeDashoffset="0"
                            className="transition-all duration-500"
                          />
                          {/* In-progress tasks */}
                          <circle
                            cx="80"
                            cy="80"
                            r="62"
                            fill="transparent"
                            stroke="#3b82f6"
                            strokeWidth="18"
                            strokeDasharray={`${(inProgressPercent / 100) * 390} 390`}
                            strokeDashoffset={`-${(completedPercent / 100) * 390}`}
                            className="transition-all duration-500"
                          />
                          {/* Review tasks */}
                          <circle
                            cx="80"
                            cy="80"
                            r="62"
                            fill="transparent"
                            stroke="#a855f7"
                            strokeWidth="18"
                            strokeDasharray={`${(inReviewPercent / 100) * 390} 390`}
                            strokeDashoffset={`-${((completedPercent + inProgressPercent) / 100) * 390}`}
                            className="transition-all duration-500"
                          />
                          {/* To-do tasks */}
                          <circle
                            cx="80"
                            cy="80"
                            r="62"
                            fill="transparent"
                            stroke="#94a3b8"
                            strokeWidth="18"
                            strokeDasharray={`${(todoPercent / 100) * 390} 390`}
                            strokeDashoffset={`-${((completedPercent + inProgressPercent + inReviewPercent) / 100) * 390}`}
                            className="transition-all duration-500"
                          />
                        </svg>

                        {/* Center text */}
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-extrabold text-slate-900">{totalTasksCount}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Deliverables
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-slate-600 font-medium">Completed</span>
                        </div>
                        <span className="font-bold text-slate-800">{completedTasksCount} ({completedPercent}%)</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                          <span className="text-slate-600 font-medium">In Progress</span>
                        </div>
                        <span className="font-bold text-slate-800">{inProgressTasksCount} ({inProgressPercent}%)</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
                          <span className="text-slate-600 font-medium">In Review / QA</span>
                        </div>
                        <span className="font-bold text-slate-800">{inReviewTasksCount} ({inReviewPercent}%)</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                          <span className="text-slate-600 font-medium">To Do</span>
                        </div>
                        <span className="font-bold text-slate-600">{todoTasksCount} ({todoPercent}%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Project Delivery Health Matrix */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Project Delivery Health & Milestones</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Current task progress and overdue counts for each project.
                    </p>
                  </div>
                  <Link
                    to="/manager/projects"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    <span>View Projects Catalog</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectsReport.map((proj) => (
                    <div
                      key={proj.id}
                      className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:bg-white hover:border-slate-300 hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/60">
                            {proj.category}
                          </span>
                          <h4 className="mt-1.5 text-sm font-bold text-slate-900">{proj.name}</h4>
                          <p className="text-[11px] text-slate-500">Lead: {proj.lead}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${proj.statusBadge}`}>
                          {proj.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-[11px] text-slate-500">
                            {proj.completedTasks} of {proj.totalTasks} deliverables done
                          </span>
                          <span className="font-extrabold text-slate-800">{proj.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              proj.overdueTasks > 0
                                ? "bg-rose-500"
                                : proj.status === "Completed"
                                ? "bg-blue-600"
                                : "bg-emerald-600"
                            }`}
                            style={{ width: `${proj.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Metric pills */}
                      <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Overdue tasks: <strong>{proj.overdueTasks}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SPRINT VELOCITY & BURNDOWN */}
          {activeTab === "velocity" && (
            <div className="space-y-6">
              {/* Multi-Sprint Velocity Trend Chart */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Weekly Task Productivity</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Tasks created compared with tasks completed in each backend reporting window.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-md bg-slate-200"></span>
                      <span className="text-slate-500 text-[11px]">Tasks Created</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-md bg-blue-600"></span>
                      <span className="font-semibold text-slate-700 text-[11px]">Tasks Completed</span>
                    </div>
                  </div>
                </div>

                {/* Velocity Bar Columns */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {sprintVelocityData.map((sprint, idx) => {
                    const isHovered = hoveredVelocitySprint === idx;

                    return (
                      <div
                        key={sprint.sprint}
                        onMouseEnter={() => setHoveredVelocitySprint(idx)}
                        onMouseLeave={() => setHoveredVelocitySprint(null)}
                        className={`rounded-2xl border p-4 transition-all duration-200 ${
                          sprint.current
                            ? "border-blue-300 bg-blue-50/40 shadow-xs"
                            : isHovered
                            ? "border-slate-300 bg-slate-50"
                            : "border-slate-200/80 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{sprint.sprint}</span>
                          {sprint.current && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[9px] font-bold text-blue-700">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-400">{sprint.dates}</p>

                        {/* Bar comparison */}
                        <div className="mt-4 flex items-end gap-2 h-36 justify-center pb-2 border-b border-slate-100">
                          {/* Planned Bar */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-semibold text-slate-400">{sprint.planned}</span>
                            <div
                              className="w-7 rounded-t-lg bg-slate-200 transition-all duration-300"
                              style={{ height: `${(sprint.planned / Math.max(1, ...sprintVelocityData.map((item) => item.planned), ...sprintVelocityData.map((item) => item.completed))) * 110}px` }}
                            ></div>
                            <span className="text-[9px] text-slate-400">Created</span>
                          </div>

                          {/* Completed Bar */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-extrabold text-blue-600">{sprint.completed}</span>
                            <div
                              className={`w-7 rounded-t-lg transition-all duration-300 ${
                                sprint.current ? "bg-gradient-to-t from-blue-600 to-indigo-500" : "bg-blue-600"
                              }`}
                              style={{ height: `${(sprint.completed / Math.max(1, ...sprintVelocityData.map((item) => item.planned), ...sprintVelocityData.map((item) => item.completed))) * 110}px` }}
                            ></div>
                            <span className="text-[9px] font-semibold text-blue-700">Done</span>
                          </div>
                        </div>

                        {/* Efficiency Stat */}
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-slate-500 text-[11px]">Completion ratio</span>
                          <span className="font-extrabold text-slate-900">{sprint.rate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Target size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Productivity reporting windows</p>
                      <p className="text-[11px] text-slate-500">
                          These periods show the task creation and completion counts returned by the reports API.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 border border-slate-200 shadow-xs self-start sm:self-auto">
                    {sprintVelocityData.length} periods
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEAM CAPACITY & OUTPUT */}
          {activeTab === "team" && (
            <div className="space-y-6">
              {/* Team Workload Table */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Team Workload & Performance</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Task completion and capacity load for workspace members.
                    </p>
                  </div>
                  <Link
                    to="/manager/workload"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-slate-50 transition"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Manage Workload Capacity</span>
                  </Link>
                </div>

                {/* Team Grid Cards */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {teamPerformanceReport.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${member.color} text-xs font-bold text-white shadow-xs`}
                          >
                            {member.avatar}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-snug">{member.name}</p>
                            <p className="text-[10px] text-slate-500">{member.role}</p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                            member.status === "Overloaded"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : member.status === "Available"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : member.status === "Busy" || member.status === "Moderate"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>

                      {/* Capacity Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-[11px] text-slate-500">Sprint Capacity</span>
                          <span className="font-extrabold text-slate-800">{member.capacity}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              member.capacity > 85 ? "bg-amber-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${member.capacity}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Deliverables stats */}
                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                        <div className="rounded-lg bg-slate-50 p-1.5">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Done</p>
                          <p className="text-xs font-extrabold text-slate-800">{member.completed}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-1.5">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Tasks</p>
                          <p className="text-xs font-extrabold text-blue-600">{member.totalTasks}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-1.5">
                          <p className="text-[9px] uppercase font-bold text-slate-400">Score</p>
                          <p className="text-xs font-extrabold text-emerald-600">{member.efficiency}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERABLES AUDIT TABLE */}
          {(activeTab === "deliverables" || activeTab === "overview") && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Workspace Tasks</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Task ownership, priority, status, and due dates from the workspace.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filter Buttons */}
                  <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {["All", "To Do", "In Progress", "In Review", "Completed"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          statusFilter === st
                            ? "bg-white text-blue-600 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-48 sm:w-60">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder="Filter deliverables..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-7 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                    {tableSearch && (
                      <button
                        type="button"
                        onClick={() => setTableSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pl-2">Deliverable</th>
                      <th className="pb-3">Project</th>
                      <th className="pb-3">Assignee</th>
                      <th className="pb-3">Priority</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3 pr-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredDeliverables.length > 0 ? (
                      filteredDeliverables.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                          onClick={() => setSelectedTaskModal(item)}
                        >
                          <td className="py-3 pl-2 max-w-xs sm:max-w-sm">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition leading-snug truncate">
                              {item.title}
                            </p>
                            <span className="text-[10px] text-slate-400">{item.id} • {item.category}</span>
                          </td>
                          <td className="py-3">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                              {item.project}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-[9px] font-bold text-white">
                                {item.avatar}
                              </div>
                              <span className="truncate max-w-[110px]">{item.assignee}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${priorityStyles[item.priority] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${statusStyles[item.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={item.health === "Overdue" ? "font-semibold text-rose-600" : "text-slate-600"}>
                              {item.dueDate}
                            </span>
                          </td>
                          <td className="py-3 pr-2 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskModal(item);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-xs"
                            >
                              <Eye size={12} />
                              <span>Audit</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-xs text-slate-500">
                          No deliverables found matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Showing <strong>{filteredDeliverables.length}</strong> of {deliverablesList.length} total deliverables
                </span>
                <span className="text-[11px]">
                  Click on any row to inspect the task record.
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
