import express from 'express';
import { ProductService, ProductNotFoundError, ProductAlreadyExistsError } from '../services/ProductService';
import { createProductSchema } from '../validation/productValidation';
import { z } from 'zod';

export class ProductController {
  constructor(private productService: ProductService) {}

  createProduct = async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // Validate input
      const validatedData = createProductSchema.parse(req.body);

      // Create product via service
      const product = await this.productService.createProduct(validatedData);

      // Return success response
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully',
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private handleError(error: unknown, res: express.Response): void {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
      return;
    }

    if (error instanceof ProductAlreadyExistsError) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    // Generic error
    console.error('Unexpected error during product creation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
