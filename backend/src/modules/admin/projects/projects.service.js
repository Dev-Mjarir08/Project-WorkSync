import mongoose from 'mongoose';
import { Project } from '../../../models/Project.js';
import { Board } from '../../../models/Board.js';
import { User } from '../../../models/User.js';
import { Activity } from '../../../models/Activity.js';
import { ApiError } from '../../../utils/ApiError.js';

export const getProjects = async (workspaceId, query = {}) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  const wsId = new mongoose.Types.ObjectId(workspaceId);

  const filter = { workspace: wsId };
  if (query.status && query.status !== 'all') {
    filter.status = query.status.toLowerCase();
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { key: { $regex: query.search, $options: 'i' } }
    ];
  }

  const projects = await Project.find(filter)
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ createdAt: -1 });

  return projects.map(p => ({
    id: p._id.toString(),
    name: p.name,
    key: p.key,
    description: p.description,
    status: p.status,
    lead: p.lead ? { id: p.lead._id.toString(), name: p.lead.name, email: p.lead.email, avatar: p.lead.avatar } : null,
    membersCount: p.members?.length || 0,
    startDate: p.startDate,
    dueDate: p.dueDate,
    createdAt: p.createdAt
  }));
};

export const createProject = async (workspaceId, data, actorUser) => {
  if (!workspaceId) throw new ApiError(400, 'Workspace ID is required');
  if (!data.name || !data.name.trim()) throw new ApiError(400, 'Project name is required');

  const cleanName = data.name.trim();
  const projectKey = (data.key || cleanName.slice(0, 3).toUpperCase()).replace(/[^A-Z0-9]/g, '');

  const project = await Project.create({
    workspace: workspaceId,
    name: cleanName,
    key: projectKey,
    description: data.description || '',
    status: data.status || 'active',
    lead: data.lead || actorUser._id,
    members: data.members || [actorUser._id],
    startDate: data.startDate,
    dueDate: data.dueDate
  });

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'PROJECT_CREATED',
    entityType: 'project',
    entityName: project.name,
    details: `Created project: ${project.name} [${project.key}]`
  }).catch(() => {});

  return project;
};

export const getProjectById = async (workspaceId, projectId) => {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId })
    .populate('lead', 'name email avatar role')
    .populate('members', 'name email avatar role');

  if (!project) throw new ApiError(404, 'Project not found');

  const boardsCount = await Board.countDocuments({ workspace: workspaceId, project: project._id });

  return {
    ...project.toJSON(),
    boardsCount
  };
};

export const updateProject = async (workspaceId, projectId, data, actorUser) => {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
  if (!project) throw new ApiError(404, 'Project not found');

  if (data.name !== undefined) project.name = data.name.trim();
  if (data.key !== undefined) project.key = data.key.trim().toUpperCase();
  if (data.description !== undefined) project.description = data.description.trim();
  if (data.status !== undefined) project.status = data.status.toLowerCase();
  if (data.lead !== undefined) project.lead = data.lead;
  if (data.startDate !== undefined) project.startDate = data.startDate;
  if (data.dueDate !== undefined) project.dueDate = data.dueDate;

  await project.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'PROJECT_UPDATED',
    entityType: 'project',
    entityName: project.name,
    details: `Updated project: ${project.name}`
  }).catch(() => {});

  return project;
};

export const deleteProject = async (workspaceId, projectId, actorUser) => {
  const project = await Project.findOneAndDelete({ _id: projectId, workspace: workspaceId });
  if (!project) throw new ApiError(404, 'Project not found');

  // Detach boards connected to this project
  await Board.updateMany({ project: project._id }, { $unset: { project: 1 } });

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'PROJECT_DELETED',
    entityType: 'project',
    entityName: project.name,
    details: `Deleted project: ${project.name}`
  }).catch(() => {});

  return {
    id: projectId,
    name: project.name,
    deleted: true
  };
};

export const updateProjectStatus = async (workspaceId, projectId, status, actorUser) => {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
  if (!project) throw new ApiError(404, 'Project not found');

  project.status = status.toLowerCase();
  await project.save();

  await Activity.create({
    workspace: workspaceId,
    user: actorUser._id,
    action: 'PROJECT_STATUS_UPDATED',
    entityType: 'project',
    entityName: project.name,
    details: `Updated project status to: ${status}`
  }).catch(() => {});

  return {
    id: project._id.toString(),
    status: project.status
  };
};

export const getProjectMembers = async (workspaceId, projectId) => {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId })
    .populate('members', 'name email avatar role');

  if (!project) throw new ApiError(404, 'Project not found');

  return project.members || [];
};

export const addProjectMembers = async (workspaceId, projectId, memberIds = [], actorUser) => {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
  if (!project) throw new ApiError(404, 'Project not found');

  const incomingIds = Array.isArray(memberIds) ? memberIds : [memberIds];
  const existingSet = new Set(project.members.map(m => m.toString()));

  incomingIds.forEach(id => {
    if (mongoose.Types.ObjectId.isValid(id) && !existingSet.has(id.toString())) {
      project.members.push(id);
    }
  });

  await project.save();
  await project.populate('members', 'name email avatar');

  return project.members;
};

export const removeProjectMember = async (workspaceId, projectId, memberId, actorUser) => {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
  if (!project) throw new ApiError(404, 'Project not found');

  project.members = project.members.filter(m => m.toString() !== memberId.toString());
  await project.save();

  return {
    projectId,
    memberId,
    removed: true
  };
};

export const getProjectBoards = async (workspaceId, projectId) => {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
  if (!project) throw new ApiError(404, 'Project not found');

  const boards = await Board.find({
    workspace: workspaceId,
    $or: [{ project: project._id }, { name: { $regex: project.name, $options: 'i' } }]
  }).sort({ createdAt: -1 });

  return boards;
};

export const getProjectActivities = async (workspaceId, projectId, query = {}) => {
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
  if (!project) throw new ApiError(404, 'Project not found');

  const activities = await Activity.find({
    workspace: workspaceId,
    $or: [
      { entityType: 'project', entityName: project.name },
      { 'metadata.projectId': project._id }
    ]
  })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(query.limit ? parseInt(query.limit, 10) : 20);

  return activities;
};
