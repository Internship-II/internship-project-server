import { Module } from '@nestjs/common';
import { FileUploadController } from './upload.controller';
import { FileStorageService } from './upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FileUploadController],
  providers: [FileStorageService],
})
export class FileUploadModule {}
