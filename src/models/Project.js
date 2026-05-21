import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  firmId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:             { type: String, required: true, trim: true },
  description:       { type: String, required: true },
  location:          { type: String, required: true },
  coordinates:       { latitude: { type: Number }, longitude: { type: Number } },
  projectType:       { type: String, enum: ['reforestation','solar','wind','biogas','mangrove','other'], required: true },
  totalCredits:      { type: Number, required: true, min: 1 },
  availableCredits:  { type: Number, required: true, min: 0 },
  pricePerCredit:    { type: Number, required: true, min: 1 },
  status:            { type: String, enum: ['draft','pending','verified','rejected','sold_out','archived'], default: 'draft' },
  images:            [String],
  verificationDocs:  [String],
  tags:              [String],
  co2Impact:         { type: Number, default: 0 },
  treesEquivalent:   { type: Number, default: 0 },
  startDate:         { type: Date, required: true },
  endDate:           { type: Date, default: null },
  rejectionReason:   { type: String, default: null },
  verifiedAt:        { type: Date, default: null },
  verifiedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  totalSold:         { type: Number, default: 0 },
  totalRevenue:      { type: Number, default: 0 },
  deletedAt:         { type: Date, default: null },
}, { timestamps: true });

ProjectSchema.index({ status: 1, availableCredits: 1 });
ProjectSchema.index({ firmId: 1, status: 1 });
ProjectSchema.index({ title: 'text', description: 'text' });
ProjectSchema.index({ pricePerCredit: 1 });

const Project = mongoose.model('Project', ProjectSchema);

export default Project;
export { Project };
