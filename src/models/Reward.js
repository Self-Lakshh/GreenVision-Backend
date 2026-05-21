import mongoose from 'mongoose';

const RewardSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  description:    { type: String },
  category:       { type: String, enum: ['merchandise','experience','digital','donation','offset_bundle'], required: true },
  pointsRequired: { type: Number, required: true, min: 1 },
  imageUrl:       { type: String },
  stock:          { type: Number, default: -1 },  // -1 = unlimited
  isActive:       { type: Boolean, default: true },
  partnerName:    { type: String },
  metadata:       { type: mongoose.Schema.Types.Mixed, default: {} },
  deletedAt:      { type: Date, default: null },
}, { timestamps: true });

RewardSchema.index({ category: 1, isActive: 1 });
RewardSchema.index({ pointsRequired: 1 });

const Reward = mongoose.model('Reward', RewardSchema);

export default Reward;
export { Reward };
