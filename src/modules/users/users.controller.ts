import { Controller, Get, Param, UseGuards, Query, Logger, Post, Body, Res, UnauthorizedException } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { UsersService } from "./users.service"
import { Response } from "express"
import { Public } from "src/modules/auth/decorators/public.decorator";

@Controller("users")
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get('verify-email')
      async verifyEmail(@Query('token') token: string) {
      this.logger.debug(`Received verification request with token: ${token}`);
      try {
      await this.usersService.verifyEmail(token);
      this.logger.debug(`Verification successful for token: ${token}`);
      return { message: "Email successfully verified" };
      } catch (error) {
      this.logger.error(`Verification failed for token: ${token}`, error);
      throw error; // NestJS will automatically return appropriate status code & message
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
}
