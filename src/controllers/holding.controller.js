import CreditHolding from '../models/CreditHolding.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export const listHoldings = async (req, res) => {
  const holdings = await CreditHolding.find({ userId: req.user.id })
    .populate('projectId', 'title projectType location pricePerCredit status coordinates co2Impact');
  
  return res.status(200).json(successResponse(holdings, 'Carbon credit portfolio retrieved successfully'));
};

export const getHoldingForProject = async (req, res) => {
  const holding = await CreditHolding.findOne({
    userId: req.user.id,
    projectId: req.params.projectId,
  }).populate('projectId', 'title projectType location pricePerCredit status coordinates co2Impact');

  if (!holding) {
    // If no holding records exist yet, return a clean schema with 0 owned
    return res.status(200).json(
      successResponse(
        {
          userId: req.user.id,
          projectId: req.params.projectId,
          creditsOwned: 0,
          creditsRetired: 0,
          avgPricePaid: 0,
          lastTransactionId: null,
        },
        'No holdings records found for this project, defaults returned'
      )
    );
  }

  return res.status(200).json(successResponse(holding, 'Credit holding details retrieved successfully'));
};

export const retireCredits = async (req, res) => {
  const { projectId, credits } = req.body;

  const holding = await CreditHolding.findOne({ userId: req.user.id, projectId });
  if (!holding || holding.creditsOwned < credits) {
    throw new AppError('Insufficient credits owned to retire', 400, 'INSUFFICIENT_HOLDINGS');
  }

  holding.creditsOwned = Math.round((holding.creditsOwned - credits) * 100) / 100;
  holding.creditsRetired = Math.round((holding.creditsRetired + credits) * 100) / 100;
  await holding.save();

  const project = await Project.findById(projectId);

  // Send Notification
  await Notification.create({
    userId: req.user.id,
    type: 'redemption',
    title: 'Credits Retired Successfully',
    message: `You successfully retired ${credits} tCO₂e credits from the "${project ? project.title : 'Carbon Offset'}" project.`,
    entityType: 'CreditHolding',
    entityId: holding._id,
  });

  return res.status(200).json(successResponse(holding, 'Credits retired successfully'));
};

export default {
  listHoldings,
  getHoldingForProject,
  retireCredits,
};
