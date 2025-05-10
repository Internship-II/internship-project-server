import { Controller, Post, Body, Get, Query, UseGuards } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { MailService } from "./mail.service"

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // Test endpoint to check if email configuration is working
  // Protected with JWT to prevent abuse
  @Get("test")
  @UseGuards(JwtAuthGuard)
  async testEmail(@Query("email") email: string) {
    await this.mailService.sendTestEmail(email);
    return { success: true, message: "Test email sent successfully" };
  }

  // Endpoint to manually send verification email
  @Post("send-verification")
  async sendVerificationEmail(@Body() body: { email: string; token: string }) {
    await this.mailService.sendVerificationEmail(body.email, body.token)
    return { success: true, message: "Verification email sent successfully" }
  }
}
