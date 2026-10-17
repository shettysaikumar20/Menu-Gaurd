import { z } from 'zod';
import { ISSUE_CATEGORIES, SEVERITIES, FINDING_STATUS, ANALYSIS_LAYERS } from './constants.js';

export const SizeVariantSchema = z.object({
  size: z.string().min(1, 'Size description is required'),
  price: z.coerce.number().min(0, 'Price must be non-negative')
});

export const MenuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().nullable()
  ),
  description: z.string().default(''),
  ingredients: z.array(z.string()).default([]),
  dietaryLabels: z.array(z.string()).default([]),
  sizeVariants: z.array(SizeVariantSchema).default([])
});

export const AuditFindingSchema = z.object({
  id: z.string(),
  category: z.nativeEnum(ISSUE_CATEGORIES),
  severity: z.nativeEnum(SEVERITIES),
  layer: z.nativeEnum(ANALYSIS_LAYERS),
  menuItemId: z.string().default('unknown'),
  menuItemName: z.string().min(1),
  explanation: z.string().min(1),
  evidence: z.string().min(1),
  suggestedCorrection: z.string().min(1),
  confidence: z.union([z.number(), z.string()]).default('HIGH'),
  status: z.nativeEnum(FINDING_STATUS).default(FINDING_STATUS.PENDING),
  humanNotes: z.string().optional().default(''),
  originalItemSnapshot: z.record(z.any()).optional(),
  correctedItemSnapshot: z.record(z.any()).optional()
});

export const AuditReportSchema = z.object({
  id: z.string(),
  restaurantName: z.string(),
  menuName: z.string(),
  timestamp: z.string(),
  totalItems: z.number(),
  totalIssues: z.number(),
  highPriorityCount: z.number(),
  resolvedCount: z.number(),
  unresolvedCount: z.number(),
  isMock: z.boolean().default(false),
  engineModel: z.string().default('Deterministic Layer + Backboard AI'),
  findings: z.array(AuditFindingSchema)
});

export const CSVRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be a valid positive number'),
  description: z.string().optional().default(''),
  ingredients: z.string().optional().default(''),
  dietaryLabels: z.string().optional().default('')
});
