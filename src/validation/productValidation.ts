import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters')
    .trim(),
  price: z
    .number()
    .positive('Price must be a positive number')
    .max(999999.99, 'Price cannot exceed 999,999.99'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name cannot be empty')
    .max(100, 'Product name must be less than 100 characters')
    .trim()
    .optional(),
  price: z
    .number()
    .positive('Price must be a positive number')
    .max(999999.99, 'Price cannot exceed 999,999.99')
    .optional(),
  description: z
    .string()
    .min(1, 'Description cannot be empty')
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
