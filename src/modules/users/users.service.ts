import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, IsNull } from "typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { User } from "./entities/user.entity"
import { CreateUserDto } from "../auth/dto/create-user.dto"
import { MailService } from "../mail/mail.service"
import { TestResult } from "../test-results/entities/test-result.entity"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { VerifyCurrentPasswordDto } from "./dto/verify-current-password.dto"

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(TestResult)
    private readonly testResultsRepository: Repository<TestResult>,
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
      role: createUserDto.role,
    })

    const savedUser = await this.usersRepository.save(user)

    try {
      await this.mailService.sendVerificationEmail(savedUser.email, verificationToken)
    } catch (error) {
      console.error("Failed to send verification email:", error)
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
      
      // Check if any user has this token in their history (might be expired)
      const allUsers = await this.usersRepository.find({
        select: ['id', 'email', 'verificationToken', 'verificationTokenExpiry', 'isEmailVerified', 'createdAt']
      });
      
      this.logger.debug(`Total users in database: ${allUsers.length}`);
      const userWithExpiredToken = allUsers.find(u => 
        u.verificationToken === null && u.isEmailVerified === false
      );
      
      if (userWithExpiredToken) {
        this.logger.debug(`Found user with cleared token but not verified: ${userWithExpiredToken.email}`);
      }

      throw new NotFoundException("Invalid or expired verification token. Please request a new verification email.");
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

  // Debug method to check token status
  async debugTokenStatus(token: string): Promise<any> {
    this.logger.debug(`Debugging token: ${token}`);
    
    // Check for exact token match
    const userWithToken = await this.usersRepository.findOne({
      where: { verificationToken: token },
      select: ['id', 'email', 'isEmailVerified', 'verificationToken', 'verificationTokenExpiry', 'createdAt']
    });

    // Get all users to see their status
    const allUsers = await this.usersRepository.find({
      select: ['id', 'email', 'isEmailVerified', 'verificationToken', 'verificationTokenExpiry', 'createdAt'],
      order: { createdAt: 'DESC' }
    });

    // Check for users with null tokens
    const usersWithNullTokens = allUsers.filter(u => u.verificationToken === null);
    const unverifiedUsers = allUsers.filter(u => !u.isEmailVerified);
    const verifiedUsers = allUsers.filter(u => u.isEmailVerified);

    return {
      searchedToken: token,
      tokenLength: token.length,
      exactMatch: userWithToken || null,
      totalUsers: allUsers.length,
      usersWithNullTokens: usersWithNullTokens.length,
      unverifiedUsers: unverifiedUsers.map(u => ({
        email: u.email,
        hasToken: u.verificationToken ? 'YES' : 'NO',
        tokenLength: u.verificationToken ? u.verificationToken.length : 0,
        isExpired: u.verificationTokenExpiry ? (u.verificationTokenExpiry < new Date()) : 'NO_EXPIRY',
        createdAt: u.createdAt
      })),
      verifiedUsers: verifiedUsers.map(u => ({
        email: u.email,
        verifiedAt: u.createdAt
      })),
      allUsers: allUsers.map(u => ({
        email: u.email,
        isVerified: u.isEmailVerified,
        hasToken: u.verificationToken ? 'YES' : 'NO',
        tokenPreview: u.verificationToken ? u.verificationToken.substring(0, 10) + '...' : 'NULL',
        createdAt: u.createdAt
      }))
    };
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
    this.logger.debug(`Generated new verification token for ${email}: ${newToken}`);

    await this.mailService.sendVerificationEmail(user.email, newToken)
  }

  async regenerateVerificationToken(email: string): Promise<{ token: string; message: string }> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email is already verified");
    }

    // Generate new token regardless of existing token status
    const newToken = crypto.randomBytes(32).toString("hex");
    const newExpiry = new Date();
    newExpiry.setHours(newExpiry.getHours() + 24);

    user.verificationToken = newToken;
    user.verificationTokenExpiry = newExpiry;

    await this.usersRepository.save(user);
    this.logger.debug(`Regenerated verification token for ${email}: ${newToken}`);

    try {
      await this.mailService.sendVerificationEmail(user.email, newToken);
      return {
        token: newToken,
        message: "New verification email sent successfully"
      };
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw new BadRequestException("Failed to send verification email");
    }
  }



  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Step 1: Verify current password first
    const user = await this.usersRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'password'] // Need to explicitly select password
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect. Please check your current password.");
    }

    // Step 2: Validate new password and confirm password match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException("New password and confirm password do not match. Please make sure both fields are identical.");
    }

    // Step 3: Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException("New password must be different from your current password. Please choose a different password.");
    }

    // Step 4: Hash and save new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await this.usersRepository.save(user);

    this.logger.debug(`Password changed successfully for user ID: ${userId}`);
  }

  async verifyCurrentPassword(userId: string, verifyPasswordDto: VerifyCurrentPasswordDto): Promise<{ isValid: boolean }> {
    const { currentPassword } = verifyPasswordDto;

    // Get user with password for verification
    const user = await this.usersRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'password'] // Need to explicitly select password
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect. Please check your password and try again.");
    }

    return { isValid: true };
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

  async verifyToken(email: string, token: string): Promise<User | null> {
    this.logger.debug(`Verifying token for email: ${email}`);
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'role', 'isEmailVerified', 'verificationToken'], // Select only needed fields
    });
    if (!user) {
      this.logger.error(`No user found for: ${email}`);
      return null;
    }
    if (!user.isEmailVerified) {
      this.logger.error(`Email not verified for: ${email}`);
      return null;
    }
    if (user.verificationToken && user.verificationToken !== token) {
      this.logger.error(`Invalid token for: ${email}`);
      return null;
    }
    this.logger.debug(`Token verified or email verified for: ${email}`);
    return user;
  }
  
  async loginVerified(email: string): Promise<User> {
    this.logger.debug(`Attempting verified login for: ${email}`);
    const user = await this.usersRepository.findOne({
      where: { email, isEmailVerified: true },
      select: ['id', 'name', 'email', 'role'], // Select only needed fields
    });
    if (!user) {
      this.logger.error(`No verified user found for: ${email}`);
      throw new NotFoundException('User not found or email not verified');
    }
    this.logger.debug(`Verified login successful for: ${email}`);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find({
      select: ['id', 'name', 'email', 'role', 'gender', 'educationLevel', 'province', 'isEmailVerified', 'createdAt', 'updatedAt']
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if user has any test results before deletion
    const testResultsCount = await this.testResultsRepository.count({
      where: { user: { id } }
    });

    if (testResultsCount > 0) {
      throw new BadRequestException(`Cannot delete user. User has ${testResultsCount} test results.`);
    }

    await this.usersRepository.remove(user);
    return { message: `User ${user.name} (${user.email}) deleted successfully` };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'name', 'email', 'role', 'gender', 'educationLevel', 'province', 'isEmailVerified', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async getUserTestResults(userId: string) {
    // First check if user exists
    const user = await this.usersRepository.findOne({ 
      where: { id: userId },
      select: ['id', 'name', 'email', 'role']
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get test results for the user
    const testResults = await this.testResultsRepository.find({
      where: { user: { id: userId } },
      relations: ['test'],
      order: { submittedAt: 'DESC' }
    });

    // Calculate summary statistics
    const totalTests = testResults.length;
    const completedTests = testResults.filter(result => result.submittedAt !== null).length;
    const averageScore = totalTests > 0 
      ? parseFloat((testResults.reduce((sum, result) => sum + (result.percentageScore || 0), 0) / totalTests).toFixed(2))
      : 0;

    // Group by subject
    const subjectStats = {};
    testResults.forEach(result => {
      const subject = result.test?.subject || 'Unknown';
      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          totalTests: 0,
          averageScore: 0,
          totalScore: 0,
          tests: []
        };
      }
      subjectStats[subject].totalTests++;
      subjectStats[subject].totalScore += result.percentageScore || 0;
      subjectStats[subject].tests.push({
        id: result.id,
        testId: result.test?.id,
        testSubject: result.test?.subject,
        score: result.score,
        totalScore: result.totalScore,
        percentageScore: result.percentageScore,
        duration: result.duration,
        submittedAt: result.submittedAt,
        createdAt: result.createdAt
      });
    });

    // Calculate average scores per subject
    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject];
      stats.averageScore = stats.totalTests > 0 ? parseFloat((stats.totalScore / stats.totalTests).toFixed(2)) : 0;
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      summary: {
        totalTests,
        completedTests,
        averageScore: Math.round(averageScore * 100) / 100
      },
      subjectStats,
      testResults: testResults.map(result => ({
        id: result.id,
        testId: result.test?.id,
        testSubject: result.test?.subject,
        score: result.score,
        totalScore: result.totalScore,
        percentageScore: result.percentageScore,
        duration: result.duration,
        submittedAt: result.submittedAt,
        createdAt: result.createdAt,
        questionResults: result.questionResults
      }))
    };
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Remove email from updateData - emails cannot be changed
    if (updateData.email) {
      delete updateData.email;
    }

    // Fields that users can update directly
    const allowedFields = [
      'name',
      'gender', 
      'educationLevel',
      'province'
    ];

    // Only update allowed fields
    const filteredUpdateData: Partial<User> = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredUpdateData[key] = updateData[key];
      }
    });



    // Merge the filtered data with the existing user
    Object.assign(user, filteredUpdateData);

    const updatedUser = await this.usersRepository.save(user);

    // Return user without sensitive information
    const { password, verificationToken, verificationTokenExpiry, ...safeUser } = updatedUser;
    return safeUser as User;
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId },
      select: [
        'id', 'name', 'email', 'role', 'gender', 'educationLevel', 
        'province', 'isEmailVerified', 'createdAt', 'updatedAt'
      ]
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    return user;
  }
}
