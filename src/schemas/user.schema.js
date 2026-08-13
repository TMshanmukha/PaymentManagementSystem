import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'At least 3 characters').regex(/^[a-zA-Z0-9._]+$/, 'Letters, numbers, dots, underscores only'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  password: z.string().min(8, 'At least 8 characters'),
  role: z.enum(['SCHOOL_ACCOUNTANT', 'TUITION_ACCOUNTANT']),
});
