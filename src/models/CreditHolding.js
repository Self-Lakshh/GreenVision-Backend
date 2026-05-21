import mongoose from 'mongoose';

const CreditHoldingSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  creditsOwned:      { type: Number, default: 0, min: 0 },
  creditsRetired:    { type: Number, default: 0, min: 0 },
  avgPricePaid:      { type: Number, default: 0 },
  lastTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },
}, { timestamps: true });

CreditHoldingSchema.index({ userId: 1, projectId: 1 }, { unique: true });

const CreditHolding = mongoose.model('CreditHolding', CreditHoldingSchema);

export default CreditHolding;
export { CreditHolding };
