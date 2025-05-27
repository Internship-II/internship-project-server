import { Controller, Get, Post, Put, Delete, Param, Body, UseInterceptors, UploadedFile, UploadedFiles, UseGuards, Logger } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionsController {
  private readonly logger = new Logger(QuestionsController.name);

  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all questions' })
  @ApiResponse({ status: 200, description: 'List of all questions' })
  async findAll() {
    return this.questionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question details' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
        type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
        questionText: { type: 'string' },
        correctAnswer: { type: 'string' },
        choices: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              isCorrect: { type: 'boolean' }
            }
          }
        },
        matchingPairs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              answer: { type: 'string' }
            }
          }
        },
        blanks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              answer: { type: 'string' }
            }
          }
        },
        questionImage: {
          type: 'string',
          format: 'binary',
        },
        choiceImages: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('questionImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'question-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  @UseInterceptors(
    FilesInterceptor('choiceImages', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'choice-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
    @UploadedFile() questionImage: Express.Multer.File,
    @UploadedFiles() choiceImages: Express.Multer.File[],
  ) {
    try {
      this.logger.debug('Received create question request with data:', createQuestionDto);
      this.logger.debug('Received questionImage:', questionImage);
      this.logger.debug('Received choiceImages:', choiceImages);
      
      const files = {
        questionImage: questionImage ? [questionImage] : undefined,
        choiceImages: choiceImages || [],
      };
      
      const result = await this.questionsService.create(createQuestionDto, files);
      this.logger.debug('Question created successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error creating question:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a question' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
        type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
        questionText: { type: 'string' },
        correctAnswer: { type: 'string' },
        choices: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              isCorrect: { type: 'boolean' }
            }
          }
        },
        matchingPairs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              answer: { type: 'string' }
            }
          }
        },
        blanks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              answer: { type: 'string' }
            }
          }
        },
        questionImage: {
          type: 'string',
          format: 'binary',
        },
        choiceImages: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('questionImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'question-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  @UseInterceptors(
    FilesInterceptor('choiceImages', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, 'choice-' + uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @UploadedFile() questionImage: Express.Multer.File,
    @UploadedFiles() choiceImages: Express.Multer.File[],
  ) {
    try {
      this.logger.debug('Received update question request with data:', updateQuestionDto);
      this.logger.debug('Received questionImage:', questionImage);
      this.logger.debug('Received choiceImages:', choiceImages);
      
      const files = {
        questionImage: questionImage ? [questionImage] : undefined,
        choiceImages: choiceImages || [],
      };
      
      const result = await this.questionsService.update(id, updateQuestionDto, files);
      this.logger.debug('Question updated successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error updating question:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async delete(@Param('id') id: string) {
    try {
      this.logger.debug('Received delete question request for ID:', id);
      const result = await this.questionsService.delete(id);
      this.logger.debug('Question deleted successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error deleting question:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }
}