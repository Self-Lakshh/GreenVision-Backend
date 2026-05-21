import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['transaction','verification','redemption','system','announcement'], required: true },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  actionUrl:  { type: String },
  entityType: { type: String },
  entityId:   { type: mongoose.Schema.Types.ObjectId },
  isRead:     { type: Boolean, default: false },
  readAt:     { type: Date },
}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
export { Notification };
