import User from '../models/User.js';
import { POINTS_PER_CREDIT, LEVEL_THRESHOLDS, CO2_PER_CREDIT, TREES_PER_CREDIT } from '../utils/constants.js';

export const awardPoints = async (userId, creditsPurchased, session = null) => {
  const points = Math.floor(creditsPurchased) * POINTS_PER_CREDIT;
  const co2Added = creditsPurchased * CO2_PER_CREDIT;
  const treesAdded = Math.floor(creditsPurchased) * TREES_PER_CREDIT;

  // Perform increment
  let user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        points,
        totalPointsEarned: points,
        co2Offset: co2Added,
        treesPlanted: treesAdded,
      },
    },
    { new: true, session }
  );

  if (!user) {
    throw new Error('User not found');
  }

  // Calculate new level based on LEVEL_THRESHOLDS
  // Find the last index where totalPointsEarned >= threshold
  let newLevel = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (user.totalPointsEarned >= LEVEL_THRESHOLDS[i]) {
      newLevel = i + 1;
    } else {
      break;
    }
  }

  // Limit level to max 50 as per schema
  newLevel = Math.min(50, newLevel);

  let leveledUp = false;
  if (newLevel > user.level) {
    leveledUp = true;
    user = await User.findByIdAndUpdate(
      userId,
      { $set: { level: newLevel } },
      { new: true, session }
    );
  }

  return {
    pointsAwarded: points,
    newTotal: user.points,
    newLevel: user.level,
    leveledUp,
  };
};

export default {
  awardPoints,
};
