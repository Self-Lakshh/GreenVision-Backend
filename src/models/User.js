import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName:          { type: String, required: true, trim: true },
  email:             { type: String, required: true, unique: true, lowercase: true },
  passwordHash:      { type: String, required: true, select: false },
  role:              { type: String, enum: ['individual','firm','corporate','admin'], default: 'individual' },
  phone:             { type: String, default: null },
  companyName:       { type: String, default: null },
  location:          { type: String, default: null },
  avatarUrl:         { type: String, default: null },
  bio:               { type: String, default: null },
  panNumber:         { type: String, default: null },
  gstNumber:         { type: String, default: null },
  kycVerified:       { type: Boolean, default: false },
  isActive:          { type: Boolean, default: true },
  // Gamification
  points:            { type: Number, default: 0, min: 0 },
  totalPointsEarned: { type: Number, default: 0 },
  level:             { type: Number, default: 1, min: 1, max: 50 },
  co2Offset:         { type: Number, default: 0 },
  treesPlanted:      { type: Number, default: 0 },
  streakDays:        { type: Number, default: 0 },
  lastActivityDate:  { type: Date, default: null },
  badges:            [{ type: String }],
  deletedAt:         { type: Date, default: null },
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ totalPointsEarned: -1 });

const User = mongoose.model('User', UserSchema);

export default User;
export { User };
