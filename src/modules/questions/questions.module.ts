import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question } from './entities/question.entity';
import { FileStorageService } from '../upload/upload.service';
import { File } from '../upload/entities/file.entity';
import { TestResult } from '../test-results/entities/test-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, File, TestResult])
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService, FileStorageService],
  exports: [QuestionsService],
})
export class QuestionsModule {}