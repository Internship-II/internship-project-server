// src/test-results/test-results.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestResult } from './entities/test-result.entity';
import { TestResultsService } from './test-results.service';
import { TestResultsController } from './test-results.controller';
import { Test } from '../tests/entities/test.entity';
import { User } from '../users/entities/user.entity';
import { Question } from '../questions/entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestResult, Test, User, Question])],
  providers: [TestResultsService],
  controllers: [TestResultsController],
})
export class TestResultsModule {}