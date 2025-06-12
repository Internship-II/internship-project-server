import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { Question } from '../questions/entities/question.entity';

@Injectable()
export class FileStorageService {
  private readonly uploadDirectory = './uploads';

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
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
    try {
      const fileDetails = await this.fileRepository.findOne({ where: { id: fileId } });
      if (!fileDetails) {
        throw new Error('File not found');
      }

      const filePath = path.join(this.uploadDirectory, fileDetails.filename);
      
      // Check if file exists before trying to delete
      try {
        await fs.access(filePath);
      } catch (err) {
        // File doesn't exist on disk, but we'll still delete the DB record
        console.log(`File not found on disk: ${filePath}`);
      }

      // Try to delete the file if it exists
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error(`Error deleting file from disk: ${err.message}`);
      }

      // Update all questions that reference this file
      await this.questionRepository.update(
        { questionImage: fileId },
        { questionImage: '' }
      );

      // Delete the database record
      await this.fileRepository.delete(fileId);
    } catch (error) {
      console.error(`Error in deleteFile: ${error.message}`);
      throw error;
    }
  }

  async listFiles(): Promise<File[]> {
    return this.fileRepository.find();
  }
}