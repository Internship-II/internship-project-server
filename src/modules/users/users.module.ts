import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { User } from "./entities/user.entity"
import { TestResult } from "../test-results/entities/test-result.entity"
import { MailModule } from "../mail/mail.module"

@Module({
  imports: [TypeOrmModule.forFeature([User, TestResult]), MailModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
