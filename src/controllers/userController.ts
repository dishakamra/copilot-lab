import express from 'express';
import { UserRegistrationService, UserAlreadyExistsError } from '../services/UserRegistrationService';
import { registerUserSchema } from '../validation/userValidation';
import { z } from 'zod';

export class UserController {
  constructor(private userRegistrationService: UserRegistrationService) {}

  registerUser = async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      // Validate input
      const validatedData = registerUserSchema.parse(req.body);

      // Register user
      const user = await this.userRegistrationService.registerUser(validatedData);

      // Return success response
      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully',
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

    if (error instanceof UserAlreadyExistsError) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    // Generic error
    console.error('Unexpected error during user registration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
