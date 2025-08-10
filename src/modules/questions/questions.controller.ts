import { Controller, Get, Post, Put, Delete, Param, Body, UseInterceptors, UploadedFile, UploadedFiles, UseGuards, Logger, Query } from '@nestjs/common';
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
  @ApiResponse({ 
    status: 200, 
    description: 'List of all questions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
          type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
          questionText: { type: 'string' },
          questionImage: { type: 'string', nullable: true },
          correctAnswer: { type: 'string' },
          score: { type: 'number' },
          choices: { type: 'array', items: { type: 'object' } },
          matchingPairs: { type: 'array', items: { type: 'object' } },
          blanks: { type: 'array', items: { type: 'object' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async findAll() {
    return this.questionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a question by ID' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Question details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
        type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
        questionText: { type: 'string' },
        questionImage: { type: 'string', nullable: true },
        correctAnswer: { type: 'string' },
        score: { type: 'number' },
        choices: { type: 'array', items: { type: 'object' } },
        matchingPairs: { type: 'array', items: { type: 'object' } },
        blanks: { type: 'array', items: { type: 'object' } },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async findOne(@Param('id') id: string, @Query('includeInactive') includeInactive?: string) {
    try {
      this.logger.debug('Received request for question, ID:', id, 'includeInactive:', includeInactive);
      const includeInactiveBool = includeInactive === 'true';
      const result = await this.questionsService.findOne(id, includeInactiveBool);
      this.logger.debug('Question retrieved successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error retrieving question:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Get(':id/shuffled')
  @ApiOperation({ summary: 'Get a question by ID with shuffled answers' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Question details with shuffled answers',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
        type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
        questionText: { type: 'string' },
        questionImage: { type: 'string', nullable: true },
        correctAnswer: { type: 'string' },
        score: { type: 'number' },
        choices: { type: 'array', items: { type: 'object' } },
        matchingPairs: { type: 'array', items: { type: 'object' } },
        blanks: { type: 'array', items: { type: 'object' } },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async findOneShuffled(@Param('id') id: string) {
    return this.questionsService.getShuffledQuestion(id);
  }

  @Post('shuffled')
  @ApiOperation({ summary: 'Get multiple questions with shuffled answers' })
  @ApiResponse({ 
    status: 200, 
    description: 'Questions with shuffled answers',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
          type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
          questionText: { type: 'string' },
          questionImage: { type: 'string', nullable: true },
          correctAnswer: { type: 'string' },
          score: { type: 'number' },
          choices: { type: 'array', items: { type: 'object' } },
          matchingPairs: { type: 'array', items: { type: 'object' } },
          blanks: { type: 'array', items: { type: 'object' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async getShuffledQuestions(@Body() body: { questionIds: string[] }) {
    return this.questionsService.getShuffledQuestions(body.questionIds);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a question (only if no test results reference it)' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question permanently deleted' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async hardDelete(@Param('id') id: string) {
    try {
      this.logger.debug('Received hard delete question request for ID:', id);
      const result = await this.questionsService.hardDelete(id);
      this.logger.debug('Question permanently deleted:', result);
      return result;
    } catch (error) {
      this.logger.error('Error hard deleting question:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore a deactivated question' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question restored successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async restore(@Param('id') id: string) {
    try {
      this.logger.debug('Received restore question request for ID:', id);
      const result = await this.questionsService.restore(id);
      this.logger.debug('Question restored successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error restoring question:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Get('all/including-inactive')
  @ApiOperation({ summary: 'Get all questions including inactive ones' })
  @ApiResponse({ status: 200, description: 'All questions retrieved successfully' })
  async findAllIncludingInactive() {
    try {
      this.logger.debug('Received request for all questions including inactive');
      const result = await this.questionsService.findAllIncludingInactive();
      this.logger.debug('All questions retrieved successfully:', result.length);
      return result;
    } catch (error) {
      this.logger.error('Error retrieving all questions:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Get(':id/including-inactive')
  @ApiOperation({ summary: 'Get a question by ID including inactive ones' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async findOneIncludingInactive(@Param('id') id: string) {
    try {
      this.logger.debug('Received request for question including inactive, ID:', id);
      const result = await this.questionsService.findOne(id, true);
      this.logger.debug('Question retrieved successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error retrieving question:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Get(':id/check-exists')
  @ApiOperation({ summary: 'Check if a question exists and its status' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question status checked successfully' })
  async checkQuestionExists(@Param('id') id: string) {
    try {
      this.logger.debug('Checking if question exists, ID:', id);
      const result = await this.questionsService.checkQuestionExists(id);
      this.logger.debug('Question existence check result:', result);
      return result;
    } catch (error) {
      this.logger.error('Error checking question existence:', error);
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Question created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
        type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
        questionText: { type: 'string' },
        questionImage: { type: 'string', nullable: true },
        correctAnswer: { type: 'string' },
        score: { type: 'number' },
        choices: { type: 'array', items: { type: 'object' } },
        matchingPairs: { type: 'array', items: { type: 'object' } },
        blanks: { type: 'array', items: { type: 'object' } },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
        type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
        questionText: { type: 'string' },
        correctAnswer: { type: 'string' },
        score: { type: 'number' },
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
  @ApiResponse({
    status: 200,
    description: 'Question updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
        type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
        questionText: { type: 'string' },
        questionImage: { type: 'string', nullable: true },
        correctAnswer: { type: 'string' },
        score: { type: 'number' },
        choices: { type: 'array', items: { type: 'object' } },
        matchingPairs: { type: 'array', items: { type: 'object' } },
        blanks: { type: 'array', items: { type: 'object' } },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', enum: ['Math', 'English', 'Logic IQ'] },
        type: { type: 'string', enum: ['MCQ', 'True or False', 'Yes or No', 'Matching', 'Fill in Blank'] },
        questionText: { type: 'string' },
        correctAnswer: { type: 'string' },
        score: { type: 'number' },
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