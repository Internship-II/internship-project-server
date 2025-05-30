import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';

@Injectable()
export class FileStorageService {
  private readonly uploadDirectory = './uploads';

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {
    this.ensureUploadDirectoryExists();
  }

  private async ensureUploadDirectoryExists() {
    try {
      await fs.mkdir(this.uploadDirectory, { recursive: true });
    } catch (err) {
      throw new Error('Failed to create upload directory');
    }
  }

  async saveFile(file: Express.Multer.File): Promise<File> {
    // Save file to disk
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDirectory, fileName);
    await fs.writeFile(filePath, file.buffer);
  
    // Save metadata to DB
    const newFile = this.fileRepository.create({
      filename: fileName,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    });

    return this.fileRepository.save(newFile);
  }

  async getFile(fileId: string): Promise<{ file: Buffer; details: File }> {
    const fileDetails = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!fileDetails) throw new Error('File not found');

    const filePath = path.join(this.uploadDirectory, fileDetails.filename);
    const file = await fs.readFile(filePath);

    return { file, details: fileDetails };
  }

  async deleteFile(fileId: string): Promise<void> {
    const fileDetails = await this.fileRepository.findOne({ where: { id: fileId } });
    if (!fileDetails) throw new Error('File not found');

    const filePath = path.join(this.uploadDirectory, fileDetails.filename);
    await fs.unlink(filePath);
    await this.fileRepository.delete(fileId);
  }

  async listFiles(): Promise<File[]> {
    return this.fileRepository.find();
  }
}