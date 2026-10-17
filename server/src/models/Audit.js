import mongoose from 'mongoose';
import { ISSUE_CATEGORIES, SEVERITIES, FINDING_STATUS, ANALYSIS_LAYERS } from '../shared/constants.js';

const FindingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  category: { type: String, enum: Object.values(ISSUE_CATEGORIES), required: true },
  severity: { type: String, enum: Object.values(SEVERITIES), required: true },
  layer: { type: String, enum: Object.values(ANALYSIS_LAYERS), required: true },
  menuItemId: { type: String, default: 'unknown' },
  menuItemName: { type: String, required: true },
  explanation: { type: String, required: true },
  evidence: { type: String, required: true },
  suggestedCorrection: { type: String, required: true },
  confidence: { type: String, default: 'HIGH' },
  status: { type: String, enum: Object.values(FINDING_STATUS), default: FINDING_STATUS.PENDING },
  humanNotes: { type: String, default: '' },
  originalItemSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  correctedItemSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

const AuditSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  restaurantName: { type: String, required: true },
  menuName: { type: String, required: true },
  totalItems: { type: Number, required: true },
  totalIssues: { type: Number, required: true },
  highPriorityCount: { type: Number, required: true },
  resolvedCount: { type: Number, required: true },
  unresolvedCount: { type: Number, required: true },
  isMock: { type: Boolean, default: false },
  engineModel: { type: String, default: 'Deterministic Layer + Backboard AI' },
  findings: [FindingSchema]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

export const AuditModel = mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
