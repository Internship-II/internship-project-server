import { Injectable, UnauthorizedException, BadRequestException, Logger } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { UsersService } from "../users/users.service"
import { User } from "../users/entities/user.entity"
import { CreateUserDto } from "./dto/create-user.dto"
import { LoginDto } from "./dto/login.dto"

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.usersService.create(createUserDto);
    return user; 
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      this.logger.debug(`Validating user: ${email}`);
      const user = await this.usersService.findByEmail(email)
      this.logger.debug(`User found: ${user ? 'yes' : 'no'}`);
      
      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      this.logger.debug(`Password valid: ${isPasswordValid}`);

      if (isPasswordValid) {
        const { password, ...result } = user
        return result
      }

      return null
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      return null
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    // Assume your UsersService has a method findByEmail
    const user = await this.usersService.findByEmail(email); 
    
    if (!user) {
      return null; // Handle user not found
    }

    return user; // Return the user object
  }
  
  async login(loginDto: LoginDto) {
    this.logger.debug(`Attempting login for: ${loginDto.email}`);
    const user = await this.validateUser(loginDto.email, loginDto.password)

    if (!user) {
      this.logger.error(`Invalid credentials for: ${loginDto.email}`);
      throw new UnauthorizedException("Invalid credentials")
    }

    this.logger.debug(`User found, checking email verification: ${user.isEmailVerified}`);
    if (!user.isEmailVerified) {
      this.logger.error(`Email not verified for: ${loginDto.email}`);
      throw new BadRequestException("Please verify your email before logging in")
    }

    const payload = { email: user.email, sub: user.id , role: user.role}
    this.logger.debug(`Generating JWT token for user: ${user.email}`);

    const token = this.jwtService.sign(payload);
    this.logger.debug(`JWT token generated successfully`);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // Include role
        isEmailVerified: user.isEmailVerified,
      },
    }
  }
  async loginVerified(email: string): Promise<User> {
    this.logger.debug(`Attempting verified login for: ${email}`);
    const user = await this.usersService.findByEmail(email);
    if (!user.isEmailVerified) {
      this.logger.error(`Email not verified for: ${email}`);
      throw new BadRequestException('Email not verified');
    }
    this.logger.debug(`Verified login successful for: ${email}`);
    return user;
  }
}
