import { z } from 'zod';

export const applyJobSchema = z.object({
  resumeUrl: z.string().trim().url('A valid resume URL is required (e.g. Google Drive, Dropbox, Portfolio link)'),
  coverNote: z.string().trim().max(1000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['shortlisted', 'rejected', 'selected'], {
    errorMap: () => ({ message: 'Status must be shortlisted, rejected, or selected' }),
  }),
  note: z.string().trim().max(500).optional(),
});
