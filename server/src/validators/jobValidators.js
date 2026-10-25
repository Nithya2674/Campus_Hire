import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  company: z.string().trim().min(2, 'Company name is required').max(120),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  location: z.string().trim().min(2, 'Location is required'),
  jobType: z.enum(['Full-time', 'Internship', 'Part-time', 'Contract'], {
    errorMap: () => ({ message: 'Invalid job type' }),
  }),
  salaryRange: z.string().trim().optional(),
  requiredSkills: z.array(z.string().trim()).optional().default([]),
  eligibility: z
    .object({
      minCgpa: z.number().min(0).max(10).optional().default(0),
      eligibleBranches: z.array(z.string().trim()).optional().default([]),
      allowedGraduationYears: z.array(z.number().int()).optional().default([]),
    })
    .optional()
    .default({}),
  status: z.enum(['draft', 'published', 'closed']).optional().default('published'),
  applicationDeadline: z.string().or(z.date()).refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Invalid deadline date',
  }),
});

export const updateJobSchema = createJobSchema.partial();
