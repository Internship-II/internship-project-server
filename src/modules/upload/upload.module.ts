import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadController } from './upload.controller';
import { FileStorageService } from './upload.service';
import { File } from './entities/file.entity';
import { Question } from '../questions/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, Question])
  ],
  controllers: [FileUploadController],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class UploadModule {}
