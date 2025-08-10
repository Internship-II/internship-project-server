import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Logger, Query } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tests')
export class TestsController {
  private readonly logger = new Logger(TestsController.name);

  constructor(private readonly testsService: TestsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tests' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all tests',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          subject: { type: 'string' },
          duration: { type: 'number' },
          numOfQuestion: { type: 'number' },
          questionPerPage: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async findAll() {
    return this.testsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test by ID with dynamically generated questions' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test details with randomized questions',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        subject: { type: 'string' },
        duration: { type: 'number' },
        numOfQuestion: { type: 'number' },
        questionPerPage: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              questionText: { type: 'string' },
              type: { type: 'string' },
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
              correctAnswer: { type: 'string' },
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
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async findOne(@Param('id') id: string, @Query('includeInactive') includeInactive?: string) {
    try {
      this.logger.debug('Received request for test, ID:', id, 'includeInactive:', includeInactive);
      const includeInactiveBool = includeInactive === 'true';
      const result = await this.testsService.findOne(id, includeInactiveBool);
      this.logger.debug('Test retrieved successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error retrieving test:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new test' })
  @ApiResponse({ 
    status: 201, 
    description: 'Test created successfully with randomized questions',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        subject: { type: 'string' },
        duration: { type: 'number' },
        numOfQuestion: { type: 'number' },
        questionPerPage: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              questionText: { type: 'string' },
              type: { type: 'string' },
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
              correctAnswer: { type: 'string' },
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
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createTestDto: CreateTestDto) {
    try {
      this.logger.debug('Received create test request with data:', createTestDto);
      const result = await this.testsService.create(createTestDto);
      this.logger.debug('Test created successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error creating test:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test updated successfully with randomized questions',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        subject: { type: 'string' },
        duration: { type: 'number' },
        numOfQuestion: { type: 'number' },
        questionPerPage: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              questionText: { type: 'string' },
              type: { type: 'string' },
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
              correctAnswer: { type: 'string' },
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
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
    try {
      this.logger.debug('Received update test request with data:', updateTestDto);
      const result = await this.testsService.update(id, updateTestDto);
      this.logger.debug('Test updated successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error updating test:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a test (soft delete if has test results)' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Test deleted/deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async delete(@Param('id') id: string) {
    try {
      this.logger.debug('Received delete test request for ID:', id);
      const result = await this.testsService.delete(id);
      this.logger.debug('Test deleted/deactivated successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error deleting test:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a test (only if no test results)' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Test permanently deleted' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async hardDelete(@Param('id') id: string) {
    try {
      this.logger.debug('Received hard delete test request for ID:', id);
      const result = await this.testsService.hardDelete(id);
      this.logger.debug('Test permanently deleted:', result);
      return result;
    } catch (error) {
      this.logger.error('Error hard deleting test:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Put(':id/restore')
  @ApiOperation({ summary: 'Restore a deactivated test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Test restored successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async restore(@Param('id') id: string) {
    try {
      this.logger.debug('Received restore test request for ID:', id);
      const result = await this.testsService.restore(id);
      this.logger.debug('Test restored successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error restoring test:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Get('all/including-inactive')
  @ApiOperation({ summary: 'Get all tests including inactive ones' })
  @ApiResponse({ status: 200, description: 'All tests retrieved successfully' })
  async findAllIncludingInactive() {
    try {
      this.logger.debug('Received request for all tests including inactive');
      const result = await this.testsService.findAllIncludingInactive();
      this.logger.debug('All tests retrieved successfully:', result.length);
      return result;
    } catch (error) {
      this.logger.error('Error retrieving all tests:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Get(':id/including-inactive')
  @ApiOperation({ summary: 'Get a test by ID including inactive ones' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Test retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async findOneIncludingInactive(@Param('id') id: string) {
    try {
      this.logger.debug('Received request for test including inactive, ID:', id);
      const result = await this.testsService.findOneIncludingInactive(id);
      this.logger.debug('Test retrieved successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error retrieving test:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }
}