import bcrypt from 'bcrypt';
import { IUserRepository } from '../domain/interfaces/IUserRepository';
import { CreateUserData, UserResponse } from '../domain/entities/User';

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class UserRegistrationService {
  private readonly SALT_ROUNDS = 10;

  constructor(private userRepository: IUserRepository) {}

  async registerUser(userData: CreateUserData): Promise<UserResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.existsByEmail(userData.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(userData.email);
    }

    // Hash password
    const passwordHash = await this.hashPassword(userData.password);

    // Create user
    const user = await this.userRepository.create({
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });

    // Return user response without password hash
    return this.mapToUserResponse(user);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private mapToUserResponse(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }
}
