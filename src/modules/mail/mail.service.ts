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
     const verificationLink = `${process.env.API_URL}/users/verify-email?token=${token}`

     const mailOptions = {
      from: this.configService.get("MAIL_FROM", "noreply@example.com"),
      to: email,
      subject: "Verify Your Email Address",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verification</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f7; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: #4a90e2; text-align: center; padding: 40px 20px; color: #fff; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; text-align: center; }
          .content p { font-size: 16px; margin: 15px 0; }
          .verify-button { display: inline-block; padding: 14px 28px; background: rgb(0, 89, 22); color: white !important; text-decoration: none; border-radius: 20px; font-weight: bold; transition: 0.3s; }
          .verify-button:hover { background:rgb(0, 168, 42); }
          .manual-link { word-break: break-all; font-size: 14px; color: #555; margin-top: 10px; display: block; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; }
          @media (max-width: 600px) { .container { margin: 20px; } .header { padding: 30px 15px; } .content { padding: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Mock Exam System</h1>
            <p>Verify Your Email</p>
          </div>
          <div class="content">
            <p>Hi there! Thanks for signing up. Please verify your email to get started.</p>
            <a href="${verificationLink}" class="verify-button">✅ Verify Email</a>
            <p class="manual-link">Or copy this link: ${verificationLink}</p>
            <p style="font-size:14px; color:#999; margin-top:20px;">
              Link expires in 24 hours. If you didn't sign up, just ignore this email.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Mock Exam System. All rights reserved.
          </div>
        </div>
      </body>
      </html>
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
