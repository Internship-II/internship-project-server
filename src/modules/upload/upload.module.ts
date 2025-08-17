import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { File } from './entities/file.entity';
import { FileStorageService } from './upload.service';
import { FileUploadController } from './upload.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    ConfigModule,
  ],
  controllers: [FileUploadController],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class UploadModule {}
