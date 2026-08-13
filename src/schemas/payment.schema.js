import { z } from 'zod';

export const paymentSchema = z.object({
  studentId: z.coerce.number().int().positive('Please select a student'),
  amount: z.coerce.number().positive('Enter an amount greater than zero'),
  paymentMethod: z.enum(['CASH', 'UPI'], { required_error: 'Select a payment method' }),
  paymentDate: z.string().min(1, 'Payment date is required'),
  remarks: z.string().optional(),
});
