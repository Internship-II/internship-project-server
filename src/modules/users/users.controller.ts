import { Controller, Get, Param, UseGuards, Query, Logger, Post, Body, Res } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { UsersService } from "./users.service"
import { Response } from "express"

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

  @Post("resend-verification")
  async resendVerificationEmail(@Body("email") email: string) {
    await this.usersService.resendVerificationEmail(email);
    return { message: "Verification email sent" };
  }
}
