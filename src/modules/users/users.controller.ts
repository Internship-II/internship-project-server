import { Controller, Get, Param, UseGuards, Query, Logger, Post, Body, Res, UnauthorizedException, Delete, Put, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { UsersService } from "./users.service"
import { Response } from "express"
import { Public } from "src/modules/auth/decorators/public.decorator";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { VerifyCurrentPasswordDto } from "./dto/verify-current-password.dto";

@Controller("users")
@ApiTags('Users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  // Profile Management Endpoints
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req) {
    const userId = req.user.id;
    return this.usersService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/verify-current-password')
  @ApiOperation({ summary: 'Verify current password (for UI validation)' })
  @ApiResponse({ status: 200, description: 'Current password verified successfully' })
  async verifyCurrentPassword(@Request() req, @Body() verifyPasswordDto: VerifyCurrentPasswordDto) {
    const userId = req.user.id;
    const result = await this.usersService.verifyCurrentPassword(userId, verifyPasswordDto);
    return { 
      message: "Current password verified successfully", 
      isValid: result.isValid 
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/change-password')
  @ApiOperation({ summary: 'Change user password (requires current password verification)' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: "Password changed successfully" };
  }

  @Get('verify-email')
      async verifyEmail(@Query('token') token: string ,
      @Res() res: Response, // use Express response
    ) {
      const isVerified = await this.usersService.verifyEmail(token); // returns boolean

      if (isVerified) {
        return res.redirect('http://localhost:3000/verify-email/verify-success');
      } else {
        return res.redirect('http://localhost:3000/verify-email/verify-error');
      }
    }

  @Public()
  @Get('debug-token')
  async debugToken(@Query('token') token: string) {
    if (!token) {
      return { error: 'Token parameter is required' };
    }
    
    this.logger.debug(`Debug token request: ${token}`);
    try {
      const debugInfo = await this.usersService.debugTokenStatus(token);
      return debugInfo;
    } catch (error) {
      this.logger.error(`Debug token failed: ${token}`, error);
      return { error: error.message };
    }
  }

  @Public()
  @Post('regenerate-verification')
  async regenerateVerification(@Body('email') email: string) {
    if (!email) {
      return { error: 'Email is required' };
    }
    
    try {
      const result = await this.usersService.regenerateVerificationToken(email);
      return result;
    } catch (error) {
      this.logger.error(`Regenerate verification failed for ${email}:`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Public() // Ensure no JWT guard
  @Post('verify-token')
  async verifyToken(@Body() body: { token: string; email: string }) {
    const { token, email } = body;
    const user = await this.usersService.verifyToken(email, token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'student',
    };
  }
  
  @Post("resend-verification")
  async resendVerificationEmail(@Body("email") email: string) {
    await this.usersService.resendVerificationEmail(email);
    return { message: "Verification email sent" };
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'All users retrieved successfully' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/test-results')
  @ApiOperation({ summary: 'Get user test results and report (Admin only)' })
  @ApiResponse({ status: 200, description: 'User test results retrieved successfully' })
  async getUserTestResults(@Param('id') id: string) {
    return this.usersService.getUserTestResults(id);
  }
}
