import mongoose from 'mongoose';
import { Workspace } from '../../../models/Workspace.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { Project } from '../../../models/Project.js';
import { User } from '../../../models/User.js';
import { AuditLog } from '../../../models/AuditLog.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const resolveWorkspaceDoc = async (workspaceIdentifier) => {
  if (!workspaceIdentifier) {
    throw new ApiError(400, 'Workspace identifier is required');
  }

  let ws = null;
  if (mongoose.Types.ObjectId.isValid(workspaceIdentifier)) {
    ws = await Workspace.findById(workspaceIdentifier);
  }

  if (!ws) {
    ws = await Workspace.findOne({ slug: workspaceIdentifier.toString().toLowerCase() });
  }

  if (!ws) {
    throw new ApiError(404, `Workspace not found with identifier: ${workspaceIdentifier}`);
  }

  return ws;
};

const recordAudit = async ({ action, category = 'workspace', details, actor, target = '', targetId = '', status = 'success' }) => {
  try {
    await AuditLog.create({
      action,
      category,
      details,
      actor: {
        user: actor?._id || actor?.id,
        name: actor?.name || 'Super Admin',
        email: actor?.email || 'admin@worksync.io'
      },
      target,
      targetId: targetId ? targetId.toString() : '',
      status
    });
  } catch (err) {
    console.error('AuditLog error:', err.message);
  }
};

export const getAllWorkspaces = async (query = {}) => {
  const { search = '', status = 'all', plan = 'all', page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const filter = {};

  if (search.trim()) {
    const cleanSearch = escapeRegex(search.trim());
    filter.$or = [
      { name: { $regex: cleanSearch, $options: 'i' } },
      { slug: { $regex: cleanSearch, $options: 'i' } }
    ];
  }

  if (status && status !== 'all') {
    filter.status = new RegExp(`^${escapeRegex(status)}$`, 'i');
  }

  if (plan && plan !== 'all') {
    filter.plan = new RegExp(`^${escapeRegex(plan)}$`, 'i');
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [rawWorkspaces, totalCount] = await Promise.all([
    Workspace.find(filter)
      .populate('owner', 'name email avatar')
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Workspace.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

  const workspaces = rawWorkspaces.map(w => ({
    id: w._id.toString(),
    name: w.name,
    slug: w.slug,
    description: w.description || '',
    plan: w.plan,
    status: w.status,
    isActive: w.isActive !== false,
    membersCount: w.membersCount || (w.members ? w.members.length : 1),
    boardsCount: w.boardsCount || 0,
    tasksCount: w.tasksCount || 0,
    storageUsed: w.storageUsed || '50 MB',
    owner: w.owner || w.ownerDetails,
    createdAt: w.createdAt
  }));

  return {
    workspaces,
    totalCount,
    pagination: {
      currentPage: parsedPage,
      totalPages,
      limit: parsedLimit,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
};

export const createWorkspace = async ({ name, slug, description = '', plan = 'Pro', ownerName = '', ownerEmail = '' }, actorAdmin) => {
  const cleanName = name.trim();
  let generatedSlug = (slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '');

  if (!generatedSlug) {
    generatedSlug = `ws-${Date.now()}`;
  }

  const existingSlug = await Workspace.findOne({ slug: generatedSlug });
  if (existingSlug) {
    generatedSlug = `${generatedSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  let ownerUser = null;
  if (ownerEmail) {
    ownerUser = await User.findOne({ email: ownerEmail.toLowerCase().trim() });
  }

  const newWorkspace = await Workspace.create({
    name: cleanName,
    slug: generatedSlug,
    description,
    plan,
    status: 'Active',
    isActive: true,
    storageUsed: '50 MB',
    owner: ownerUser ? ownerUser._id : (actorAdmin?._id || null),
    ownerDetails: {
      name: ownerName || ownerUser?.name || actorAdmin?.name || 'Super Admin',
      email: ownerEmail || ownerUser?.email || actorAdmin?.email || 'admin@worksync.io'
    },
    membersCount: 1,
    boardsCount: 0,
    tasksCount: 0
  });

  if (newWorkspace.owner) {
    await WorkspaceMember.create({
      workspace: newWorkspace._id,
      user: newWorkspace.owner,
      role: 'owner',
      status: 'active'
    });
  }

  await recordAudit({
    action: 'Workspace Created',
    details: `Workspace "${newWorkspace.name}" provisioned under ${newWorkspace.plan} tier`,
    actor: actorAdmin,
    target: newWorkspace.name,
    targetId: newWorkspace._id.toString()
  });

  return {
    id: newWorkspace._id.toString(),
    name: newWorkspace.name,
    slug: newWorkspace.slug,
    description: newWorkspace.description,
    plan: newWorkspace.plan,
    status: newWorkspace.status,
    membersCount: newWorkspace.membersCount,
    createdAt: newWorkspace.createdAt
  };
};

export const getWorkspaceById = async (workspaceIdentifier) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);
  await ws.populate('owner', 'name email avatar');

  return {
    id: ws._id.toString(),
    name: ws.name,
    slug: ws.slug,
    description: ws.description || '',
    plan: ws.plan,
    status: ws.status,
    isActive: ws.isActive !== false,
    membersCount: ws.membersCount || 1,
    boardsCount: ws.boardsCount || 0,
    tasksCount: ws.tasksCount || 0,
    storageUsed: ws.storageUsed || '50 MB',
    owner: ws.owner || ws.ownerDetails,
    createdAt: ws.createdAt,
    updatedAt: ws.updatedAt
  };
};

export const updateWorkspace = async (workspaceIdentifier, updateData, actorAdmin) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);

  if (updateData.name !== undefined) ws.name = updateData.name.trim();
  if (updateData.description !== undefined) ws.description = updateData.description.trim();
  if (updateData.plan !== undefined) ws.plan = updateData.plan;
  if (updateData.storageUsed !== undefined) ws.storageUsed = updateData.storageUsed;

  if (updateData.slug && updateData.slug.toLowerCase() !== ws.slug) {
    const slugConflict = await Workspace.findOne({ slug: updateData.slug.toLowerCase(), _id: { $ne: ws._id } });
    if (slugConflict) {
      throw new ApiError(409, `Workspace slug '${updateData.slug}' is already taken`);
    }
    ws.slug = updateData.slug.toLowerCase().trim();
  }

  await ws.save();

  await recordAudit({
    action: 'Workspace Updated',
    details: `Updated workspace details for "${ws.name}"`,
    actor: actorAdmin,
    target: ws.name,
    targetId: ws._id.toString()
  });

  return {
    id: ws._id.toString(),
    name: ws.name,
    slug: ws.slug,
    description: ws.description,
    plan: ws.plan,
    status: ws.status,
    storageUsed: ws.storageUsed,
    updatedAt: ws.updatedAt
  };
};

export const updateWorkspaceStatus = async (workspaceIdentifier, { status, isActive }, actorAdmin) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);

  let targetStatus = ws.status;
  if (status) {
    targetStatus = status;
  } else if (typeof isActive === 'boolean') {
    targetStatus = isActive ? 'Active' : 'Archived';
  } else {
    targetStatus = ws.status === 'Active' ? 'Archived' : 'Active';
  }

  ws.status = targetStatus;
  ws.isActive = targetStatus === 'Active';
  await ws.save();

  await recordAudit({
    action: targetStatus === 'Active' ? 'Workspace Activated' : 'Workspace Suspended',
    details: `Workspace "${ws.name}" status changed to ${targetStatus}`,
    actor: actorAdmin,
    target: ws.name,
    targetId: ws._id.toString()
  });

  return {
    id: ws._id.toString(),
    name: ws.name,
    status: ws.status,
    isActive: ws.isActive
  };
};

export const deleteWorkspace = async (workspaceIdentifier, actorAdmin) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);
  const deletedId = ws._id.toString();
  const deletedName = ws.name;

  await Promise.all([
    Workspace.findByIdAndDelete(ws._id),
    WorkspaceMember.deleteMany({ workspace: ws._id }),
    Board.deleteMany({ workspace: ws._id }),
    Task.deleteMany({ workspace: ws._id })
  ]);

  await recordAudit({
    action: 'Workspace Deleted',
    details: `Workspace "${deletedName}" was decommissioned and removed`,
    actor: actorAdmin,
    target: deletedName,
    targetId: deletedId,
    status: 'warning'
  });

  return {
    id: deletedId,
    name: deletedName,
    deleted: true
  };
};

export const getWorkspaceBoards = async (workspaceIdentifier) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);
  const boards = await Board.find({ workspace: ws._id })
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();

  return {
    workspaceId: ws._id.toString(),
    workspaceName: ws.name,
    totalBoards: boards.length,
    boards: boards.map(b => ({
      id: b._id.toString(),
      name: b.name,
      description: b.description || '',
      isArchived: b.isArchived || false,
      createdBy: b.createdBy,
      createdAt: b.createdAt
    }))
  };
};

export const getWorkspaceActivities = async (workspaceIdentifier, limit = 20) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const activities = await Activity.find({ workspace: ws._id })
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .populate('user', 'name email avatar')
    .lean();

  if (activities.length > 0) {
    return {
      workspaceId: ws._id.toString(),
      workspaceName: ws.name,
      totalCount: activities.length,
      activities: activities.map(a => ({
        id: a._id.toString(),
        action: a.action,
        type: a.type,
        description: a.description,
        user: a.user ? { id: a.user._id.toString(), name: a.user.name } : null,
        createdAt: a.createdAt
      }))
    };
  }

  const logs = await AuditLog.find({
    $or: [{ targetId: ws._id.toString() }, { target: ws.name }]
  })
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .lean();

  return {
    workspaceId: ws._id.toString(),
    workspaceName: ws.name,
    totalCount: logs.length,
    activities: logs.map(l => ({
      id: l._id.toString(),
      action: l.action,
      details: l.details,
      actor: l.actor?.name || 'System',
      createdAt: l.createdAt
    }))
  };
};

export const getWorkspaceAnalytics = async (workspaceIdentifier) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);

  const [membersCount, boardsCount, tasksCount, taskStatuses] = await Promise.all([
    WorkspaceMember.countDocuments({ workspace: ws._id }),
    Board.countDocuments({ workspace: ws._id }),
    Task.countDocuments({ workspace: ws._id }),
    Task.aggregate([
      { $match: { workspace: ws._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const statusBreakdown = { todo: 0, in_progress: 0, review: 0, done: 0 };
  taskStatuses.forEach(s => {
    if (s._id && statusBreakdown[s._id] !== undefined) {
      statusBreakdown[s._id] = s.count;
    }
  });

  const completionRate = tasksCount > 0 ? Math.round((statusBreakdown.done / tasksCount) * 100) : 0;

  return {
    workspaceId: ws._id.toString(),
    workspaceName: ws.name,
    plan: ws.plan,
    metrics: {
      totalMembers: membersCount || ws.membersCount || 1,
      totalBoards: boardsCount || ws.boardsCount || 0,
      totalTasks: tasksCount || ws.tasksCount || 0,
      completionRate: `${completionRate}%`
    },
    tasksBreakdown: statusBreakdown
  };
};

export const getWorkspaceProjects = async (workspaceIdentifier) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);

  const projects = await Project.find({ workspace: ws._id })
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ createdAt: -1 });

  return {
    workspaceId: ws._id.toString(),
    totalProjects: projects.length,
    projects: projects.map(p => ({
      id: p._id.toString(),
      name: p.name,
      key: p.key,
      description: p.description,
      status: p.status,
      lead: p.lead ? { id: p.lead._id.toString(), name: p.lead.name, email: p.lead.email } : null,
      membersCount: p.members?.length || 0,
      createdAt: p.createdAt
    }))
  };
};

export const createWorkspaceProject = async (workspaceIdentifier, data, actorAdmin) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);
  if (!data.name || !data.name.trim()) throw new ApiError(400, 'Project name is required');

  const cleanName = data.name.trim();
  const projectKey = (data.key || cleanName.slice(0, 3).toUpperCase()).replace(/[^A-Z0-9]/g, '');

  const project = await Project.create({
    workspace: ws._id,
    name: cleanName,
    key: projectKey,
    description: data.description || '',
    status: data.status || 'active',
    lead: data.lead || actorAdmin._id,
    members: data.members || [actorAdmin._id],
    startDate: data.startDate,
    dueDate: data.dueDate
  });

  await recordAudit({
    action: 'Workspace Project Created',
    details: `Super Admin created project "${project.name}" in workspace "${ws.name}"`,
    actor: actorAdmin,
    target: project.name,
    targetId: project._id.toString()
  });

  return project;
};

export const addWorkspaceMember = async (workspaceIdentifier, data, actorAdmin) => {
  const ws = await resolveWorkspaceDoc(workspaceIdentifier);
  const userId = data.userId || data.user;
  if (!userId) throw new ApiError(400, 'User ID is required');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const existingMember = await WorkspaceMember.findOne({ workspace: ws._id, user: user._id });
  if (existingMember) {
    existingMember.role = data.role || existingMember.role;
    existingMember.status = 'active';
    await existingMember.save();
    return existingMember;
  }

  const member = await WorkspaceMember.create({
    workspace: ws._id,
    user: user._id,
    role: data.role || 'member',
    status: 'active'
  });

  await Workspace.findByIdAndUpdate(ws._id, { $inc: { membersCount: 1 } });

  await recordAudit({
    action: 'Workspace Member Added',
    details: `User ${user.name} added to workspace "${ws.name}" with role ${member.role}`,
    actor: actorAdmin,
    target: user.name,
    targetId: user._id.toString()
  });

  return member;
};


