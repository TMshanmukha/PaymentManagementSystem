import { z } from 'zod';

const phoneRegex = /^[0-9+\-\s]{7,20}$/;

export const studentSchema = z.object({
  name: z.string().min(2, 'Student name is required'),
  parentName: z.string().min(2, 'Parent name is required'),
  parentPhone: z.string().regex(phoneRegex, 'Enter a valid phone number'),
  studentPhone: z.string().optional(),
  class: z.string().optional(),
  section: z.string().optional(),
  studentType: z.enum(['SCHOOL', 'TUITION']),
  admissionType: z.enum(['REGULAR', 'SCHOLARSHIP']).default('REGULAR'),
  academicYearId: z.coerce.number().int().positive('Academic year is required'),
  totalFee: z.coerce.number().min(0, 'Total fee cannot be negative'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  address: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
