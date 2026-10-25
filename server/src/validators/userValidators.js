import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  profile: z
    .object({
      college: z.string().trim().optional(),
      degree: z.string().trim().optional(),
      branch: z.string().trim().optional(),
      graduationYear: z.number().int().min(2000).max(2040).nullable().optional(),
      cgpa: z.number().min(0).max(10).nullable().optional(),
      skills: z.array(z.string().trim()).optional(),
      resumeUrl: z.string().trim().url('Resume URL must be a valid link').or(z.literal('')).optional(),
      phone: z.string().trim().optional(),
      bio: z.string().trim().max(500).optional(),
      companyName: z.string().trim().optional(),
      designation: z.string().trim().optional(),
      companyWebsite: z.string().trim().optional(),
      companyLocation: z.string().trim().optional(),
    })
    .optional(),
});
