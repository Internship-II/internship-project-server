import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Delete, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from './upload.service';
import { Public } from '../auth/decorators/public.decorator';
import { 
  UploadResponseDto, 
  PictureUrlResponseDto, 
  PictureDetailsDto, 
  PictureSummaryDto, 
  CloudStorageStatusDto 
} from './dto/upload-response.dto';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  /**
   * Upload picture to cloud and return picture ID
   * @param file - The uploaded picture file
   * @returns Picture ID string for database storage
   */
  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No picture file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and GIF images are allowed.');
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 50MB.');
    }

    try {
      const pictureId = await this.fileStorageService.uploadToCloud(file);
      return {
        pictureId,
        message: 'Picture uploaded successfully to cloud'
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to upload picture: ${error.message}`);
    }
  }

  /**
   * Get picture URL by ID
   * @param pictureId - The picture ID from database
   * @returns Direct cloud URL for the picture
   */
  @Public()
  @Get(':id/url')
  async getPictureUrl(@Param('id') pictureId: string): Promise<PictureUrlResponseDto> {
    try {
      const url = await this.fileStorageService.getPictureUrl(pictureId);
      return { url, pictureId };
    } catch (error) {
      if (error.message === 'Picture not found') {
        throw new NotFoundException('Picture not found');
      }
      throw new InternalServerErrorException(`Failed to get picture URL: ${error.message}`);
    }
  }

  /**
   * Get picture details by ID
   * @param pictureId - The picture ID
   * @returns Picture details
   */
  @Public()
  @Get(':id')
  async getPictureDetails(@Param('id') pictureId: string): Promise<PictureDetailsDto> {
    try {
      return await this.fileStorageService.getPictureDetails(pictureId);
    } catch (error) {
      if (error.message === 'Picture not found') {
        throw new NotFoundException('Picture not found');
      }
      throw new InternalServerErrorException(`Failed to get picture details: ${error.message}`);
    }
  }

  /**
   * Delete picture by ID
   * @param pictureId - The picture ID to delete
   * @returns Success message
   */
  @Delete(':id')
  async deletePicture(@Param('id') pictureId: string): Promise<{ message: string; pictureId: string }> {
    try {
      await this.fileStorageService.deletePicture(pictureId);
      return {
        message: 'Picture deleted successfully',
        pictureId
      };
    } catch (error) {
      if (error.message === 'Picture not found') {
        throw new NotFoundException('Picture not found');
      }
      throw new InternalServerErrorException(`Failed to delete picture: ${error.message}`);
    }
  }

  /**
   * List all pictures
   * @returns Array of picture summaries
   */
  @Public()
  @Get()
  async listPictures(): Promise<PictureSummaryDto[]> {
    try {
      return await this.fileStorageService.listPictures();
    } catch (error) {
      throw new InternalServerErrorException(`Failed to list pictures: ${error.message}`);
    }
  }

  /**
   * Check cloud storage status
   * @returns Cloud storage configuration status
   */
  @Public()
  @Get('status/cloud')
  async getCloudStorageStatus(): Promise<CloudStorageStatusDto> {
    return this.fileStorageService.getCloudStorageStatus();
  }
}