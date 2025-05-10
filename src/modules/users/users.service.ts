// import { Injectable, ConflictException, NotFoundException } from "@nestjs/common"
// import { InjectRepository } from "@nestjs/typeorm"
// import type { Repository } from "typeorm"
// import * as bcrypt from "bcrypt"
// import type { CreateUserDto } from "../auth/dto/create-user.dto"
// import { User } from "./user.entity"

// @Injectable()
// export class UsersService {
//   constructor(
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//   ) {}

//   async create(createUserDto: CreateUserDto): Promise<User> {
//     // Check if email already exists
//     const existingUser = await this.usersRepository.findOne({
//       where: { email: createUserDto.email },
//     })

//     if (existingUser) {
//       throw new ConflictException("Email already exists")
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

//     // Create new user
//     const user = this.usersRepository.create({
//       ...createUserDto,
//       password: hashedPassword,
//     })

//     return await this.usersRepository.save(user)
//   }

//   async findByEmail(email: string): Promise<User> {
//     const user = await this.usersRepository.findOne({
//       where: { email },
//     })

//     if (!user) {
//       throw new NotFoundException(`User with email ${email} not found`)
//     }

//     return user
//   }

//   async findById(id: string): Promise<User> {
//     const user = await this.usersRepository.findOne({
//       where: { id },
//     })

//     if (!user) {
//       throw new NotFoundException(`User with id ${id} not found`)
//     }

//     return user
//   }
// }
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { User } from "./user.entity" // Adjust path if needed
import { CreateUserDto } from "../auth/dto/create-user.dto" // Adjust path if needed
import { MailService } from "../mail/mail.service" // Adjust path if needed

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new ConflictException("Email already exists")
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpiry = new Date()
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24)

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry,
      isEmailVerified: false,
    })

    const savedUser = await this.usersRepository.save(user)

    try {
      await this.mailService.sendVerificationEmail(savedUser.email, verificationToken)
    } catch (error) {
      console.error("Failed to send verification email:", error)
      // You may choose to delete user if critical, or log only
    }

    return savedUser
  }

  async verifyEmail(token: string): Promise<boolean> {
    this.logger.debug(`Finding user with token: ${token}`);
    const user = await this.usersRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      this.logger.error(`No user found with token: ${token}`);
      throw new NotFoundException("Invalid verification token");
    }

    this.logger.debug(`Found user: ${user.email}, current verification status: ${user.isEmailVerified}`);
    this.logger.debug(`Token expiry: ${user.verificationTokenExpiry}, current time: ${new Date()}`);

    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      this.logger.error(`Token expired for user: ${user.email}`);
      throw new BadRequestException("Verification token has expired");
    }

    this.logger.debug(`Verifying email for user: ${user.email}`);
    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;

    await this.usersRepository.save(user);
    this.logger.debug(`Email verified for user: ${user.email}`);
    return true;
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } })

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`)
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email is already verified")
    }

    const newToken = crypto.randomBytes(32).toString("hex")
    const newExpiry = new Date()
    newExpiry.setHours(newExpiry.getHours() + 24)

    user.verificationToken = newToken
    user.verificationTokenExpiry = newExpiry

    await this.usersRepository.save(user)

    await this.mailService.sendVerificationEmail(user.email, newToken)
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } })

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`)
    }

    return user
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    return user
  }
}
