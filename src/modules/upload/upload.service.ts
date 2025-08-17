import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { File } from './entities/file.entity';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadDirectory = './uploads';
  private readonly useCloudStorage: boolean;

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {
    this.ensureUploadDirectoryExists();
    this.useCloudStorage = this.configService.get('CLOUDINARY_CLOUD_NAME') !== undefined;
    
    if (this.useCloudStorage) {
      this.initializeCloudinary();
    }
  }

  private initializeCloudinary() {
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
    // Removed verbose logging
  }

  private async ensureUploadDirectoryExists() {
    try {
      await fs.mkdir(this.uploadDirectory, { recursive: true });
    } catch (err) {
      throw new Error('Failed to create upload directory');
    }
  }

  /**
   * Upload file to cloud and return picture ID
   * @param file - The uploaded file
   * @returns Picture ID string for database storage
   */
  async uploadToCloud(file: Express.Multer.File): Promise<string> {
    try {
      if (!this.useCloudStorage) {
        throw new Error('Cloud storage not configured. Please set Cloudinary credentials.');
      }

      // Generate timestamp-based filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = path.extname(file.originalname);
      const timestampedFilename = `file_${timestamp}${fileExtension}`;

      // Upload to Cloudinary with timestamped filename
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'question-bank',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ],
            public_id: timestampedFilename, // Use timestamped filename as public_id
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      // Save metadata to DB with timestamped filename
      const newFile = this.fileRepository.create({
        filename: timestampedFilename, // Use timestamped filename
        originalName: file.originalname, // Keep original name for reference
        size: file.size,
        mimeType: file.mimetype,
        cloudUrl: result.secure_url,
        cloudPublicId: result.public_id,
        storageType: 'cloud',
      });

      const savedFile = await this.fileRepository.save(newFile);

      // Return just the picture ID string
      return savedFile.id;

    } catch (error) {
      this.logger.error(`Cloud upload failed: ${error.message}`);
      throw new Error(`Failed to upload file to cloud: ${error.message}`);
    }
  }

  /**
   * Get file URL by picture ID
   * @param pictureId - The picture ID from database
   * @returns Direct cloud URL for the image
   */
  async getPictureUrl(pictureId: string): Promise<string> {
    const fileRecord = await this.fileRepository.findOne({ where: { id: pictureId } });
    if (!fileRecord) {
      throw new Error('Picture not found');
    }

    if (fileRecord.storageType === 'cloud' && fileRecord.cloudUrl) {
      return fileRecord.cloudUrl;
    } else {
      throw new Error('Picture is not stored in cloud');
    }
  }

  /**
   * Delete picture from cloud by ID
   * @param pictureId - The picture ID to delete
   */
  async deletePicture(pictureId: string): Promise<void> {
    try {
      const fileRecord = await this.fileRepository.findOne({ where: { id: pictureId } });
      if (!fileRecord) {
        throw new Error('Picture not found');
      }

      if (fileRecord.storageType === 'cloud' && fileRecord.cloudPublicId) {
        // Delete from Cloudinary
        await new Promise<void>((resolve, reject) => {
          cloudinary.uploader.destroy(fileRecord.cloudPublicId, (error, result) => {
            if (error) reject(error);
            else resolve();
          });
        });
        // Removed verbose logging
      }

      // Update questions that reference this picture
      await getRepository('Question').update(
        { questionImage: pictureId },
        { questionImage: '' }
      );

      // Delete the database record
      await this.fileRepository.delete(pictureId);
      // Removed verbose logging

    } catch (error) {
      this.logger.error(`Error deleting picture: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get picture details by ID
   * @param pictureId - The picture ID
   * @returns Picture details object
   */
  async getPictureDetails(pictureId: string): Promise<{
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    cloudUrl: string;
    createdAt: Date;
  }> {
    const fileRecord = await this.fileRepository.findOne({ where: { id: pictureId } });
    if (!fileRecord) {
      throw new Error('Picture not found');
    }

    return {
      id: fileRecord.id,
      originalName: fileRecord.originalName,
      size: fileRecord.size,
      mimeType: fileRecord.mimeType,
      cloudUrl: fileRecord.cloudUrl,
      createdAt: fileRecord.createdAt,
    };
  }

  /**
   * List all pictures with basic info
   * @returns Array of picture summaries
   */
  async listPictures(): Promise<Array<{
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    createdAt: Date;
  }>> {
    const files = await this.fileRepository.find({
      where: { storageType: 'cloud' },
      select: ['id', 'originalName', 'size', 'mimeType', 'createdAt']
    });

    return files.map(file => ({
      id: file.id,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
    }));
  }

  /**
   * Check if cloud storage is available
   * @returns Boolean indicating if cloud storage is configured
   */
  isCloudStorageAvailable(): boolean {
    return this.useCloudStorage;
  }

  /**
   * Get cloud storage status
   * @returns Status object with configuration details
   */
  getCloudStorageStatus(): {
    available: boolean;
    provider: string;
    configured: boolean;
  } {
    return {
      available: this.useCloudStorage,
      provider: 'cloudinary',
      configured: this.configService.get('CLOUDINARY_CLOUD_NAME') !== undefined,
    };
  }
}