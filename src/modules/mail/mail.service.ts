import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as nodemailer from "nodemailer"

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter

  constructor(private readonly configService: ConfigService) {
    // Create a test account if no SMTP settings are provided
    this.initializeTransporter()
  }

  private async initializeTransporter() {
    // Check if SMTP settings are provided in environment variables
    const host = this.configService.get("MAIL_HOST")
    const port = this.configService.get("MAIL_PORT")
    const user = this.configService.get("MAIL_USER")
    const pass = this.configService.get("MAIL_PASS")

    if (host && port && user && pass) {
      // Use provided SMTP settings
      this.transporter = nodemailer.createTransport({
        host,
        port: Number.parseInt(port, 10),
        secure: port === "465",
        auth: {
          user,
          pass,
        },
      })
    } else {
      // Create a test account using Ethereal for development
      const testAccount = await nodemailer.createTestAccount()
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const baseUrl = this.configService.get("FRONTEND_URL", "http://localhost:3000")
    const apiUrl = this.configService.get("API_URL", "http://localhost:3001")
    const verificationLink = `${apiUrl}/users/verify-email?token=${token}`

    const mailOptions = {
      from: this.configService.get("MAIL_FROM", "noreply@example.com"),
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't register for an account, please ignore this email.</p>
        </div>
      `,
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log("Verification email sent: %s", info.messageId)

      // For development with Ethereal, log the preview URL
      if (info.messageId && !this.configService.get("MAIL_HOST")) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
      }
    } catch (error) {
      console.error("Error sending verification email:", error)
      throw new Error("Failed to send verification email")
    }
  }

  async sendTestEmail(email: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get("MAIL_FROM", "noreply@example.com"),
      to: email,
      subject: "Email Configuration Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <p>If you received this email, your email service is properly configured!</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `,
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log("Test email sent: %s", info.messageId)

      // For development with Ethereal, log the preview URL
      if (info.messageId && !this.configService.get("MAIL_HOST")) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      throw new Error("Failed to send test email")
    }
  }
}
