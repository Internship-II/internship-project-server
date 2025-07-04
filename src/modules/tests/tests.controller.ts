// import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Logger } from '@nestjs/common';
// import { TestsService } from './tests.service';
// import { CreateTestDto } from './dto/create-test.dto';
// import { UpdateTestDto } from './dto/update-test.dto';
// import { AssignQuestionsDto } from './dto/assign-questions.dto';
// import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// @ApiTags('Tests')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
// @Controller('tests')
// export class TestsController {
//   private readonly logger = new Logger(TestsController.name);

//   constructor(private readonly testsService: TestsService) {}

//   @Get()
//   @ApiOperation({ summary: 'Get all tests' })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'List of all tests',
//     schema: {
//       type: 'array',
//       items: {
//         type: 'object',
//         properties: {
//           id: { type: 'string' },
//           subject: { type: 'string' },
//           duration: { type: 'string' },
//           numOfQuestion: { type: 'number' },
//           questionPerPage: { type: 'number' },
//           createdAt: { type: 'string', format: 'date-time' },
//           updatedAt: { type: 'string', format: 'date-time' }
//         }
//       }
//     }
//   })
//   async findAll() {
//     return this.testsService.findAll();
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Get a test by ID' })
//   @ApiParam({ name: 'id', description: 'Test ID' })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'Test details',
//     schema: {
//       type: 'object',
//       properties: {
//         id: { type: 'string' },
//         subject: { type: 'string' },
//         duration: { type: 'string' },
//         numOfQuestion: { type: 'number' },
//         questionPerPage: { type: 'number' },
//         createdAt: { type: 'string', format: 'date-time' },
//         updatedAt: { type: 'string', format: 'date-time' }
//       }
//     }
//   })
//   @ApiResponse({ status: 404, description: 'Test not found' })
//   async findOne(@Param('id') id: string) {
//     return this.testsService.findOne(id);
//   }

//   @Post()
//   @ApiOperation({ summary: 'Create a new test' })
//   @ApiResponse({ 
//     status: 201, 
//     description: 'Test created successfully',
//     schema: {
//       type: 'object',
//       properties: {
//         id: { type: 'string' },
//         subject: { type: 'string' },
//         duration: { type: 'string' },
//         numOfQuestion: { type: 'number' },
//         questionPerPage: { type: 'number' },
//         createdAt: { type: 'string', format: 'date-time' },
//         updatedAt: { type: 'string', format: 'date-time' }
//       }
//     }
//   })
//   async create(@Body() createTestDto: CreateTestDto) {
//     try {
//       this.logger.debug('Received create test request with data:', createTestDto);
//       const result = await this.testsService.create(createTestDto);
//       this.logger.debug('Test created successfully:', result);
//       return result;
//     } catch (error) {
//       this.logger.error('Error creating test:', error);
//       this.logger.error('Error stack:', error.stack);
//       throw error;
//     }
//   }

//   @Put(':id')
//   @ApiOperation({ summary: 'Update a test' })
//   @ApiParam({ name: 'id', description: 'Test ID' })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'Test updated successfully',
//     schema: {
//       type: 'object',
//       properties: {
//         id: { type: 'string' },
//         subject: { type: 'string' },
//         duration: { type: 'string' },
//         numOfQuestion: { type: 'number' },
//         questionPerPage: { type: 'number' },
//         createdAt: { type: 'string', format: 'date-time' },
//         updatedAt: { type: 'string', format: 'date-time' }
//       }
//     }
//   })
//   @ApiResponse({ status: 404, description: 'Test not found' })
//   async update(@Param('id') id: string, @Body() updateTestDto: UpdateTestDto) {
//     try {
//       this.logger.debug('Received update test request with data:', updateTestDto);
//       const result = await this.testsService.update(id, updateTestDto);
//       this.logger.debug('Test updated successfully:', result);
//       return result;
//     } catch (error) {
//       this.logger.error('Error updating test:', error);
//       this.logger.error('Error stack:', error.stack);
//       throw error;
//     }
//   }

//   @Delete(':id')
//   @ApiOperation({ summary: 'Delete a test' })
//   @ApiParam({ name: 'id', description: 'Test ID' })
//   @ApiResponse({ status: 200, description: 'Test deleted successfully' })
//   @ApiResponse({ status: 404, description: 'Test not found' })
//   async delete(@Param('id') id: string) {
//     try {
//       this.logger.debug('Received delete test request for ID:', id);
//       const result = await this.testsService.delete(id);
//       this.logger.debug('Test deleted successfully:', result);
//       return result;
//     } catch (error) {
//       this.logger.error('Error deleting test:', error);
//       this.logger.error('Error stack:', error.stack);
//       throw error;
//     }
//   }

//   @Post(':id/assign-questions')
//   @ApiOperation({ summary: 'Assign questions to a test' })
//   @ApiParam({ name: 'id', description: 'Test ID' })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'Questions assigned successfully',
//     schema: {
//       type: 'object',
//       properties: {
//         id: { type: 'string' },
//         subject: { type: 'string' },
//         duration: { type: 'string' },
//         numOfQuestion: { type: 'number' },
//         questionPerPage: { type: 'number' },
//         questions: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               id: { type: 'string' },
//               questionText: { type: 'string' },
//               type: { type: 'string' },
//               score: { type: 'number' }
//             }
//           }
//         },
//         createdAt: { type: 'string', format: 'date-time' },
//         updatedAt: { type: 'string', format: 'date-time' }
//       }
//     }
//   })
//   @ApiResponse({ status: 404, description: 'Test not found' })
//   @ApiResponse({ status: 400, description: 'Invalid question IDs' })
//   async assignQuestions(@Param('id') id: string, @Body() assignQuestionsDto: AssignQuestionsDto) {
//     try {
//       this.logger.debug('Received assign questions request with data:', assignQuestionsDto);
//       const result = await this.testsService.assignQuestions(id, assignQuestionsDto);
//       this.logger.debug('Questions assigned successfully:', result);
//       return result;
//     } catch (error) {
//       this.logger.error('Error assigning questions:', error);
//       this.logger.error('Error stack:', error.stack);
//       throw error;
//     }
//   }

//   @Post(':id/regenerate-questions')
//   @ApiOperation({ summary: 'Regenerate random questions for a test' })
//   @ApiParam({ name: 'id', description: 'Test ID' })
//   @ApiResponse({ 
//     status: 200, 
//     description: 'Random questions regenerated successfully',
//     schema: {
//       type: 'object',
//       properties: {
//         id: { type: 'string' },
//         subject: { type: 'string' },
//         duration: { type: 'string' },
//         numOfQuestion: { type: 'number' },
//         questionPerPage: { type: 'number' },
//         questions: {
//           type: 'array',
//           items: {
//             type: 'object',
//             properties: {
//               id: { type: 'string' },
//               questionText: { type: 'string' },
//               type: { type: 'string' },
//               score: { type: 'number' }
//             }
//           }
//         },
//         createdAt: { type: 'string', format: 'date-time' },
//         updatedAt: { type: 'string', format: 'date-time' }
//       }
//     }
//   })
//   @ApiResponse({ status: 404, description: 'Test not found' })
//   @ApiResponse({ status: 400, description: 'Not enough questions available' })
//   async regenerateQuestions(@Param('id') id: string) {
//     try {
//       this.logger.debug('Received regenerate questions request for test ID:', id);
//       const test = await this.testsService.findOne(id);
//       const result = await this.testsService.assignRandomQuestions(id, test.subject, test.numOfQuestion);
//       this.logger.debug('Questions regenerated successfully:', result);
//       return result;
//     } catch (error) {
//       this.logger.error('Error regenerating questions:', error);
//       this.logger.error('Error stack:', error.stack);
//       throw error;
//     }
//   }
// } 



import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Logger } from '@nestjs/common';
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
  async findOne(@Param('id') id: string) {
    return this.testsService.findOne(id);
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
  @ApiOperation({ summary: 'Delete a test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Test deleted successfully' })
  @ApiResponse({ status: 404, description: 'Test not found' })
  async delete(@Param('id') id: string) {
    try {
      this.logger.debug('Received delete test request for ID:', id);
      const result = await this.testsService.delete(id);
      this.logger.debug('Test deleted successfully:', result);
      return result;
    } catch (error) {
      this.logger.error('Error deleting test:', error);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }
}