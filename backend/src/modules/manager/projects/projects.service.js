import mongoose from 'mongoose';
import { Project } from '../../../models/Project.js';
import { Board } from '../../../models/Board.js';
import { Task } from '../../../models/Task.js';
import { User } from '../../../models/User.js';
import { WorkspaceMember } from '../../../models/WorkspaceMember.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getProjects = async (workspaceId, query = {}, user) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const filter = { workspace: wsId };

  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }
  if (query.priority && query.priority !== 'all') {
    filter.priority = query.priority.toLowerCase();
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { key: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }
  if (query.myProjects === 'true' && user) {
    const userId = new mongoose.Types.ObjectId(user._id);
    filter.$and = filter.$and || [];
    filter.$and.push({ $or: [{ lead: userId }, { members: userId }] });
  }

  const projects = await Project.find(filter)
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ createdAt: -1 });

  const projectIds = projects.map(p => p._id);
  const [taskCounts, boardCounts] = await Promise.all([
    Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: '$project',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } }
        }
      }
    ]),
    Board.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$project', total: { $sum: 1 } } }
    ])
  ]);

  const taskMap = {};
  taskCounts.forEach(t => {
    taskMap[t._id.toString()] = t;
  });

  const boardMap = {};
  boardCounts.forEach(b => {
    boardMap[b._id.toString()] = b.total;
  });

  return projects.map(p => {
    const pId = p._id.toString();
    const tData = taskMap[pId] || { total: 0, completed: 0 };
    return {
      id: pId,
      name: p.name,
      key: p.key,
      description: p.description,
      status: p.status,
      priority: p.priority || 'medium',
      lead: p.lead
        ? {
            id: p.lead._id.toString(),
            name: p.lead.name,
            email: p.lead.email,
            avatar: p.lead.avatar
          }
        : null,
      members: (p.members || []).map(m => ({
        id: m._id.toString(),
        name: m.name,
        email: m.email,
        avatar: m.avatar
      })),
      membersCount: p.members?.length || 0,
      totalTasks: tData.total,
      completedTasks: tData.completed,
      boardsCount: boardMap[pId] || 0,
      progress: tData.total > 0 ? Math.round((tData.completed / tData.total) * 100) : 0,
      startDate: p.startDate,
      dueDate: p.dueDate,
      createdAt: p.createdAt
    };
  });
};

export const createProject = async (workspaceId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!data.name || !data.name.trim()) throw new ApiError(400, 'Project name is required');

  const cleanName = data.name.trim();
  const rawKey = data.key || cleanName.slice(0, 3).toUpperCase();
  const projectKey = rawKey.replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'PRJ';

  const leadId = data.lead || actorUser._id;
  const initialMembers = Array.isArray(data.members) ? data.members : [];
  if (!initialMembers.some(m => m.toString() === actorUser._id.toString())) {
    initialMembers.push(actorUser._id);
  }

  const project = await Project.create({
    workspace: workspaceId,
    name: cleanName,
    key: projectKey,
    description: data.description || '',
    status: data.status || 'active',
    priority: data.priority || 'medium',
    lead: leadId,
    members: initialMembers,
    startDate: data.startDate,
    dueDate: data.dueDate
  });

  const populated = await Project.findById(project._id)
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar');

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Created project "${cleanName}"`,
    type: 'workspace',
    entityType: 'project',
    entityId: project._id,
    entityName: cleanName,
    details: `Manager created project ${cleanName} (${projectKey})`
  }).catch(() => {});

  return {
    id: populated._id.toString(),
    name: populated.name,
    key: populated.key,
    description: populated.description,
    status: populated.status,
    priority: populated.priority,
    lead: populated.lead,
    members: populated.members,
    startDate: populated.startDate,
    dueDate: populated.dueDate,
    createdAt: populated.createdAt
  };
};

export const getProjectById = async (workspaceId, projectId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId
  })
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!project) throw new ApiError(404, 'Project not found in this workspace');

  const [totalTasks, completedTasks, boardsCount] = await Promise.all([
    Task.countDocuments({ project: project._id }),
    Task.countDocuments({ project: project._id, status: 'done' }),
    Board.countDocuments({ project: project._id })
  ]);

  return {
    id: project._id.toString(),
    name: project.name,
    key: project.key,
    description: project.description,
    status: project.status,
    priority: project.priority || 'medium',
    lead: project.lead
      ? {
          id: project.lead._id.toString(),
          name: project.lead.name,
          email: project.lead.email,
          avatar: project.lead.avatar
        }
      : null,
    members: (project.members || []).map(m => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      avatar: m.avatar
    })),
    membersCount: project.members?.length || 0,
    totalTasks,
    completedTasks,
    boardsCount,
    progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    startDate: project.startDate,
    dueDate: project.dueDate,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
};

export const updateProject = async (workspaceId, projectId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId
  });
  if (!project) throw new ApiError(404, 'Project not found');

  if (data.name !== undefined) project.name = data.name.trim();
  if (data.key !== undefined) project.key = data.key.trim().toUpperCase();
  if (data.description !== undefined) project.description = data.description;
  if (data.status !== undefined) project.status = data.status;
  if (data.priority !== undefined) project.priority = data.priority;
  if (data.lead !== undefined) project.lead = data.lead;
  if (data.startDate !== undefined) project.startDate = data.startDate;
  if (data.dueDate !== undefined) project.dueDate = data.dueDate;

  await project.save();

  const updated = await Project.findById(project._id)
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar');

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Updated project "${project.name}"`,
    type: 'workspace',
    entityType: 'project',
    entityId: project._id,
    entityName: project.name,
    details: `Project details updated by manager`
  }).catch(() => {});

  return {
    id: updated._id.toString(),
    name: updated.name,
    key: updated.key,
    description: updated.description,
    status: updated.status,
    priority: updated.priority,
    lead: updated.lead,
    members: updated.members,
    startDate: updated.startDate,
    dueDate: updated.dueDate,
    updatedAt: updated.updatedAt
  };
};

export const deleteProject = async (workspaceId, projectId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId
  });
  if (!project) throw new ApiError(404, 'Project not found');

  const projectName = project.name;
  await Project.findByIdAndDelete(project._id);

  // Unlink or clean up boards / tasks linked to this project
  await Promise.all([
    Board.updateMany({ project: project._id }, { $unset: { project: 1 } }),
    Task.updateMany({ project: project._id }, { $unset: { project: 1 } })
  ]);

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Deleted project "${projectName}"`,
    type: 'workspace',
    entityType: 'project',
    entityId: project._id,
    entityName: projectName,
    details: `Project "${projectName}" was deleted`
  }).catch(() => {});

  return {
    success: true,
    deletedId: projectId,
    message: `Project "${projectName}" deleted successfully`
  };
};

export const updateProjectStatus = async (workspaceId, projectId, status, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');
  if (!status) throw new ApiError(400, 'Status is required');

  const validStatuses = ['planning', 'active', 'on_hold', 'completed', 'archived'];
  const normalized = status.toLowerCase();
  if (!validStatuses.includes(normalized)) {
    throw new ApiError(400, `Invalid status. Must be one of: [${validStatuses.join(', ')}]`);
  }

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId
  });
  if (!project) throw new ApiError(404, 'Project not found');

  const oldStatus = project.status;
  project.status = normalized;
  await project.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Changed status of "${project.name}" to ${normalized}`,
    type: 'workspace',
    entityType: 'project',
    entityId: project._id,
    entityName: project.name,
    details: `Status transitioned from ${oldStatus} to ${normalized}`
  }).catch(() => {});

  return {
    id: project._id.toString(),
    status: project.status,
    previousStatus: oldStatus
  };
};

export const updateProjectPriority = async (workspaceId, projectId, priority, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');
  if (!priority) throw new ApiError(400, 'Priority is required');

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  const normalized = priority.toLowerCase();
  if (!validPriorities.includes(normalized)) {
    throw new ApiError(400, `Invalid priority. Must be one of: [${validPriorities.join(', ')}]`);
  }

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId
  });
  if (!project) throw new ApiError(404, 'Project not found');

  const oldPriority = project.priority || 'medium';
  project.priority = normalized;
  await project.save();

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Changed priority of "${project.name}" to ${normalized}`,
    type: 'workspace',
    entityType: 'project',
    entityId: project._id,
    entityName: project.name,
    details: `Priority changed from ${oldPriority} to ${normalized}`
  }).catch(() => {});

  return {
    id: project._id.toString(),
    priority: project.priority,
    previousPriority: oldPriority
  };
};

export const getProjectMembers = async (workspaceId, projectId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId
  }).populate('members', 'name email avatar role');

  if (!project) throw new ApiError(404, 'Project not found');

  return (project.members || []).map(m => ({
    id: m._id.toString(),
    name: m.name,
    email: m.email,
    avatar: m.avatar,
    role: m.role
  }));
};

export const addProjectMembers = async (workspaceId, projectId, memberIds, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');
  if (!memberIds || (Array.isArray(memberIds) && memberIds.length === 0)) {
    throw new ApiError(400, 'At least one member ID is required');
  }

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId
  });
  if (!project) throw new ApiError(404, 'Project not found');

  const idsToAdd = (Array.isArray(memberIds) ? memberIds : [memberIds]).map(
    id => new mongoose.Types.ObjectId(id)
  );

  await Project.findByIdAndUpdate(project._id, {
    $addToSet: { members: { $each: idsToAdd } }
  });

  const updated = await Project.findById(project._id).populate(
    'members',
    'name email avatar role'
  );

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Assigned ${idsToAdd.length} member(s) to "${project.name}"`,
    type: 'workspace',
    entityType: 'project',
    entityId: project._id,
    entityName: project.name
  }).catch(() => {});

  return (updated.members || []).map(m => ({
    id: m._id.toString(),
    name: m.name,
    email: m.email,
    avatar: m.avatar,
    role: m.role
  }));
};

export const removeProjectMember = async (workspaceId, projectId, memberId, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');
  if (!memberId) throw new ApiError(400, 'Member ID is required');

  const project = await Project.findOne({
    _id: projectId,
    workspace: workspaceId
  });
  if (!project) throw new ApiError(404, 'Project not found');

  await Project.findByIdAndUpdate(project._id, {
    $pull: { members: new mongoose.Types.ObjectId(memberId) }
  });

  await Activity.create({
    user: actorUser._id,
    workspace: workspaceId,
    action: `Removed member from project "${project.name}"`,
    type: 'workspace',
    entityType: 'project',
    entityId: project._id,
    entityName: project.name
  }).catch(() => {});

  return {
    success: true,
    removedMemberId: memberId,
    message: 'Member removed from project'
  };
};

export const getProjectBoards = async (workspaceId, projectId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');

  const boards = await Board.find({
    project: projectId,
    workspace: workspaceId
  })
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: -1 });

  return boards.map(b => ({
    id: b._id.toString(),
    name: b.name,
    description: b.description,
    isArchived: b.isArchived,
    tasksCount: b.tasksCount,
    createdBy: b.createdBy
      ? {
          id: b.createdBy._id.toString(),
          name: b.createdBy.name,
          email: b.createdBy.email
        }
      : null,
    createdAt: b.createdAt
  }));
};

export const getProjectActivities = async (workspaceId, projectId) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!projectId) throw new ApiError(400, 'Project ID is required');

  const activities = await Activity.find({
    workspace: workspaceId,
    $or: [{ entityId: projectId }, { 'metadata.projectId': projectId }]
  })
    .populate('user', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(30);

  return activities.map(a => ({
    id: a._id.toString(),
    action: a.action,
    type: a.type,
    description: a.description,
    user: a.user
      ? {
          id: a.user._id.toString(),
          name: a.user.name,
          email: a.user.email,
          avatar: a.user.avatar
        }
      : null,
    createdAt: a.createdAt
  }));
};
