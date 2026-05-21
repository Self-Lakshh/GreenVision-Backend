import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  location: z.string().trim().min(2, 'Location is required'),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }).optional(),
  projectType: z.enum(['reforestation', 'solar', 'wind', 'biogas', 'mangrove', 'other']),
  totalCredits: z.number().min(1, 'Total credits must be at least 1'),
  pricePerCredit: z.number().min(1, 'Price per credit must be at least ₹1'),
  co2Impact: z.number().min(0).optional().default(0),
  treesEquivalent: z.number().min(0).optional().default(0),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().optional().nullable().transform((val) => val ? new Date(val) : null),
  tags: z.array(z.string()).optional().default([]),
  images: z.array(z.string().url()).optional().default([]),
  verificationDocs: z.array(z.string()).optional().default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export const searchProjectSchema = z.object({
  query: z.string().trim().min(1, 'Search query is required'),
});

export default {
  createProjectSchema,
  updateProjectSchema,
  searchProjectSchema,
};
