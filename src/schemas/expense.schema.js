import { z } from 'zod';

export const expenseSchema = z.object({
  categoryName: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Enter an amount greater than zero'),
  expenseType: z.enum(['SCHOOL', 'TUITION']),
  paymentMethod: z.enum(['CASH', 'UPI']),
  expenseDate: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});
