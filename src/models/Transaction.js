import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  buyerId:                { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId:              { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  creditsPurchased:       { type: Number, required: true, min: 0.01 },
  pricePerCreditSnapshot: { type: Number, required: true },
  totalAmount:            { type: Number, required: true },
  gstAmount:              { type: Number, default: 0 },
  razorpayOrderId:        { type: String, default: null },
  razorpayPaymentId:      { type: String, default: null },
  razorpaySignature:      { type: String, default: null, select: false },
  paymentStatus:          { type: String, enum: ['pending','completed','failed','refunded'], default: 'pending' },
  certificateUrl:         { type: String, default: null },
  certificateGeneratedAt: { type: Date, default: null },
  notes:                  { type: String, default: null },
}, { timestamps: true });

TransactionSchema.index({ buyerId: 1, createdAt: -1 });
TransactionSchema.index({ projectId: 1, paymentStatus: 1 });
TransactionSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
TransactionSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
export { Transaction };
