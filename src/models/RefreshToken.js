import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token:     { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  userAgent: { type: String },
  ipAddress: { type: String },
}, { timestamps: true });

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

export default RefreshToken;
export { RefreshToken };
