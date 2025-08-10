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

  private generateSafeFileName(originalName: string): string {
    // Extract file extension
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    
    // Sanitize filename: remove/replace dangerous characters
    let safeName = nameWithoutExt
      .toLowerCase()
      .trim()
      // Replace spaces and special chars with underscores
      .replace(/[^a-z0-9.-]/g, '_')
      // Remove multiple consecutive underscores
      .replace(/_+/g, '_')
      // Remove leading/trailing underscores
      .replace(/^_+|_+$/g, '')
      // Limit length (keeping room for timestamp and extension)
      .substring(0, 50);
    
    // Handle edge cases
    if (!safeName || safeName.length === 0) {
      safeName = 'file';
    }
    
    // Windows reserved names check
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    if (reservedNames.includes(safeName.toUpperCase())) {
      safeName = `file_${safeName}`;
    }
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    
    return `${timestamp}_${randomStr}_${safeName}${ext.toLowerCase()}`;
  }

  async saveFile(file: Express.Multer.File): Promise<File> {
    // Save file to disk
    const fileName = this.generateSafeFileName(file.originalname);
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