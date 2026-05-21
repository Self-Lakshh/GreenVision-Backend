import User from '../models/User.js';
import Project from '../models/Project.js';
import Transaction from '../models/Transaction.js';
import CreditHolding from '../models/CreditHolding.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export const getIndividualDashboard = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const holdings = await CreditHolding.find({ userId: req.user.id })
    .populate('projectId', 'title projectType location pricePerCredit status coordinates');

  const recentTransactions = await Transaction.find({ buyerId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('projectId', 'title projectType');

  const totalCreditsOwned = holdings.reduce((acc, h) => acc + h.creditsOwned, 0);
  const totalCreditsRetired = holdings.reduce((acc, h) => acc + h.creditsRetired, 0);

  const dashboardData = {
    user: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      points: user.points,
      totalPointsEarned: user.totalPointsEarned,
      level: user.level,
      co2Offset: user.co2Offset,
      treesPlanted: user.treesPlanted,
      streakDays: user.streakDays,
      badges: user.badges,
    },
    portfolio: {
      totalCreditsOwned,
      totalCreditsRetired,
      holdings,
    },
    recentTransactions,
  };

  return res.status(200).json(successResponse(dashboardData, 'Individual dashboard retrieved successfully'));
};

export const getFirmDashboard = async (req, res) => {
  const projects = await Project.find({ firmId: req.user.id, deletedAt: null });

  const totalSold = projects.reduce((acc, p) => acc + p.totalSold, 0);
  const totalRevenue = projects.reduce((acc, p) => acc + p.totalRevenue, 0);

  const projectsSummary = projects.map((p) => ({
    id: p._id,
    title: p.title,
    projectType: p.projectType,
    status: p.status,
    totalCredits: p.totalCredits,
    availableCredits: p.availableCredits,
    pricePerCredit: p.pricePerCredit,
    totalSold: p.totalSold,
    totalRevenue: p.totalRevenue,
    co2Impact: p.co2Impact,
  }));

  const dashboardData = {
    totalProjects: projects.length,
    totalSold,
    totalRevenue,
    projects: projectsSummary,
  };

  return res.status(200).json(successResponse(dashboardData, 'Firm dashboard retrieved successfully'));
};

export const getAdminDashboard = async (req, res) => {
  const [
    totalUsers,
    totalFirms,
    totalCorporates,
    completedTransactions,
    projectStatusCounts,
  ] = await Promise.all([
    User.countDocuments({ role: 'individual', deletedAt: null }),
    User.countDocuments({ role: 'firm', deletedAt: null }),
    User.countDocuments({ role: 'corporate', deletedAt: null }),
    Transaction.find({ paymentStatus: 'completed' }),
    Project.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const totalRevenue = completedTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalGstCollected = completedTransactions.reduce((acc, t) => acc + t.gstAmount, 0);
  const totalCreditsTraded = completedTransactions.reduce((acc, t) => acc + t.creditsPurchased, 0);

  const statusMap = {
    draft: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
    sold_out: 0,
    archived: 0,
  };

  projectStatusCounts.forEach((group) => {
    if (statusMap[group._id] !== undefined) {
      statusMap[group._id] = group.count;
    }
  });

  const dashboardData = {
    userCounts: {
      individuals: totalUsers,
      firms: totalFirms,
      corporates: totalCorporates,
      total: totalUsers + totalFirms + totalCorporates,
    },
    kpis: {
      totalRevenue,
      totalGstCollected,
      grandTotalCollected: totalRevenue + totalGstCollected,
      totalCreditsTraded,
      transactionCount: completedTransactions.length,
    },
    projectsByStatus: statusMap,
  };

  return res.status(200).json(successResponse(dashboardData, 'Admin dashboard retrieved successfully'));
};

export const getLeaderboard = async (req, res) => {
  const topUsers = await User.find({
    role: { $in: ['individual', 'corporate'] },
    deletedAt: null,
  })
    .sort({ totalPointsEarned: -1 })
    .limit(20)
    .select('fullName level totalPointsEarned avatarUrl location co2Offset role companyName');

  return res.status(200).json(successResponse(topUsers, 'Loyalty points leaderboard retrieved'));
};

export default {
  getIndividualDashboard,
  getFirmDashboard,
  getAdminDashboard,
  getLeaderboard,
};
