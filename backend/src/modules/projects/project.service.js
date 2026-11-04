import { Project } from '../../models/Project.js';
import { ApiError } from '../../utils/ApiError.js';

export const getProjects = async (workspaceId, query = {}) => {
  const filter = { workspace: workspaceId };
  if (query.status) filter.status = query.status;
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

  return projects;
};

export const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return project;
};

export const createProject = async (data, creator) => {
  const project = await Project.create({
    ...data,
    lead: data.lead || creator._id
  });

  return project.populate('lead members', 'name email avatar');
};

export const updateProject = async (projectId, data) => {
  const project = await Project.findByIdAndUpdate(projectId, data, { new: true })
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return project;
};

export const deleteProject = async (projectId) => {
  const project = await Project.findByIdAndDelete(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return { id: projectId, deleted: true };
};

