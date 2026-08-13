import { z } from 'zod';

export const expenseSchema = z.object({
  categoryId: z.coerce.number().int().positive('Select a category'),
  amount: z.coerce.number().positive('Enter an amount greater than zero'),
  expenseType: z.enum(['SCHOOL', 'TUITION']),
  paymentMethod: z.enum(['CASH', 'UPI']),
  expenseDate: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});
