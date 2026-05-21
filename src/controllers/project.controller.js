import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import emailService from '../services/email.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';
import { paginate } from '../utils/paginate.js';
import logger from '../utils/logger.js';

export const listProjects = async (req, res) => {
  const {
    type,
    location,
    minPrice,
    maxPrice,
    search,
    page = 1,
    limit = 20,
    sort = 'createdAt',
  } = req.query;

  const filter = { status: 'verified', deletedAt: null };

  if (type) {
    filter.projectType = type;
  }

  if (location) {
    filter.location = new RegExp(location, 'i');
  }

  if (minPrice || maxPrice) {
    filter.pricePerCredit = {};
    if (minPrice) filter.pricePerCredit.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerCredit.$lte = Number(maxPrice);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  // Handle sorting map
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { pricePerCredit: 1 };
  if (sort === 'price_desc') sortOption = { pricePerCredit: -1 };
  if (sort === 'impact') sortOption = { co2Impact: -1 };

  const result = await paginate(Project, filter, {
    page: Number(page),
    limit: Number(limit),
    sort: sortOption,
    populate: [{ path: 'firmId', select: 'fullName companyName avatarUrl location' }],
  });

  return res.status(200).json(successResponse(result.data, 'Projects retrieved successfully', result.meta));
};

export const getProjectDetails = async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null })
    .populate('firmId', 'fullName companyName avatarUrl location bio');

  if (!project) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }

  return res.status(200).json(successResponse(project, 'Project details retrieved successfully'));
};

export const searchProjects = async (req, res) => {
  const { query } = req.body;
  
  // Perform search using text index
  const projects = await Project.find(
    {
      $text: { $search: query },
      status: 'verified',
      deletedAt: null,
    },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .populate('firmId', 'fullName companyName avatarUrl location');

  return res.status(200).json(successResponse(projects, 'Project search results'));
};

export const createProject = async (req, res) => {
  const projectData = {
    ...req.body,
    firmId: req.user.id,
    status: 'pending',
    availableCredits: req.body.totalCredits,
  };

  const project = await Project.create(projectData);
  const firmUser = await User.findById(req.user.id);

  // Notify admins (async, non-blocking)
  User.find({ role: 'admin' })
    .then((admins) => {
      emailService.sendNewProjectPendingAlert(admins, project, firmUser)
        .catch((err) => logger.error(`Error sending pending project admin email: ${err.message}`));
    })
    .catch((err) => logger.error(`Error fetching admins for alert: ${err.message}`));

  return res.status(201).json(successResponse(project, 'Project listing submitted, pending verification'));
};

export const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project || project.deletedAt) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }

  // Verify ownership
  if (project.firmId.toString() !== req.user.id) {
    throw new AppError('Access denied. You do not own this project.', 403, 'FORBIDDEN');
  }

  // Verify status (only draft or rejected can be updated)
  if (project.status !== 'draft' && project.status !== 'rejected') {
    throw new AppError('Only projects in draft or rejected status can be updated', 400, 'UPDATE_INVALID_STATUS');
  }

  // Merge updates
  const updates = { ...req.body };
  if (updates.totalCredits !== undefined) {
    updates.availableCredits = updates.totalCredits;
  }

  // Set status back to pending if it was rejected previously to trigger review
  if (project.status === 'rejected') {
    updates.status = 'pending';
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return res.status(200).json(successResponse(updatedProject, 'Project updated successfully'));
};

export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project || project.deletedAt) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }

  // Admin can delete, firm can only delete their own
  if (req.user.role !== 'admin' && project.firmId.toString() !== req.user.id) {
    throw new AppError('Access denied. You do not own this project.', 403, 'FORBIDDEN');
  }

  project.deletedAt = new Date();
  project.status = 'archived';
  await project.save();

  return res.status(200).json(successResponse(null, 'Project deleted successfully'));
};

export const getMyProjects = async (req, res) => {
  const projects = await Project.find({ firmId: req.user.id, deletedAt: null });

  const totalSold = projects.reduce((acc, p) => acc + p.totalSold, 0);
  const totalRevenue = projects.reduce((acc, p) => acc + p.totalRevenue, 0);

  return res.status(200).json(
    successResponse(
      projects,
      'Your projects retrieved successfully',
      { totalSold, totalRevenue }
    )
  );
};

export const verifyProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project || project.deletedAt) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }

  project.status = 'verified';
  project.verifiedAt = new Date();
  project.verifiedBy = req.user.id;
  await project.save();

  const firmUser = await User.findById(project.firmId);

  // In-app notification
  await Notification.create({
    userId: project.firmId,
    type: 'verification',
    title: 'Project Verified',
    message: `Your project "${project.title}" has been verified and is now live on the marketplace.`,
    entityType: 'Project',
    entityId: project._id,
  });

  // Attempt Email (async)
  if (firmUser) {
    emailService.sendProjectVerified(firmUser, project)
      .catch((err) => logger.error(`Error sending project verified email: ${err.message}`));
  }

  return res.status(200).json(successResponse(project, 'Project verified and published successfully'));
};

export const rejectProject = async (req, res) => {
  const { reason } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project || project.deletedAt) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }

  project.status = 'rejected';
  project.rejectionReason = reason;
  await project.save();

  const firmUser = await User.findById(project.firmId);

  // In-app notification
  await Notification.create({
    userId: project.firmId,
    type: 'verification',
    title: 'Project Update Required',
    message: `Your project "${project.title}" was not approved. Reason: ${reason}`,
    entityType: 'Project',
    entityId: project._id,
  });

  // Attempt Email (async)
  if (firmUser) {
    emailService.sendProjectRejected(firmUser, project, reason)
      .catch((err) => logger.error(`Error sending project rejected email: ${err.message}`));
  }

  return res.status(200).json(successResponse(project, 'Project rejected successfully'));
};

export default {
  listProjects,
  getProjectDetails,
  searchProjects,
  createProject,
  updateProject,
  deleteProject,
  getMyProjects,
  verifyProject,
  rejectProject,
};
