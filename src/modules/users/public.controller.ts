// import { Controller, Get, Query, Logger, Res } from "@nestjs/common"
// import { Response } from "express"
// import { UsersService } from "./users.service"

// @Controller("public")
// export class PublicController {
//   private readonly logger = new Logger(PublicController.name)

//   constructor(private readonly usersService: UsersService) {}

//   @Get("verify-email")
//   async verifyEmail(
//     @Query("token") token: string,
//     @Res() res: Response
//   ) {
//     this.logger.debug(`Received verification request with token: ${token}`)
//     try {
//       await this.usersService.verifyEmail(token)
//       this.logger.debug(`Verification successful for token: ${token}`)
//       // Redirect to frontend dashboard or success page
//       return res.redirect("http://localhost:3000/dashboard")
//     } catch (error) {
//       this.logger.error(`Verification failed for token: ${token}`, error)
//       // Optional: Redirect to a failure page
//       return res.redirect("http://localhost:3000/verification-failed")
//     }
//   }
// }
