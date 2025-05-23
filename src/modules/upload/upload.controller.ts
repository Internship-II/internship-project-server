import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, Delete, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { File } from './file.entity';
import { FileStorageService } from './upload.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<File> {
    return this.fileStorageService.saveFile(file);
  }

  @Public()
  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const { file, details } = await this.fileStorageService.getFile(id);
    res.setHeader('Content-Type', details.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${details.originalName}"`);
    res.send(file);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    await this.fileStorageService.deleteFile(id);
    return { message: 'File deleted successfully' };
  }

  @Public()
  @Get()
  async listFiles(): Promise<File[]> {
    return this.fileStorageService.listFiles();
  }
}