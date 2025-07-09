// // src/test-results/test-results.controller.ts
// import { Controller, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { TestResultsService } from './test-results.service';
// import { TestResult } from './entities/test-result.entity';

// @Controller('tests/:id/submit')
// @UseGuards(AuthGuard('jwt'))
// export class TestResultsController {
//   constructor(private readonly testResultsService: TestResultsService) {}

//   @Post()
//   async submitAnswers(
//     @Param('id') testId: string,
//     @Body() body: { answers: Record<string, any>, questionIds: string[] },
//     @Request() req,
//   ): Promise<TestResult> {
//     const userId = req.user.id; // From JWT payload
//     const result = await this.testResultsService.submitAnswers(
//       testId,
//       userId,
//       { answers: body.answers, questionIds: body.questionIds },
//     );

//     return result;
//   }
// }


import { Controller, Post, Get, Body, Param, Request, UseGuards, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TestResultsService } from './test-results.service';
import { TestResult } from './entities/test-result.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Test Results')
@ApiBearerAuth()
@Controller('test-results')
@UseGuards(AuthGuard('jwt'))
export class TestResultsController {
  constructor(private readonly testResultsService: TestResultsService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new test attempt' })
  @ApiResponse({
    status: 201,
    description: 'Test attempt started successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        test: {
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
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        answers: { type: 'object' },
        score: { type: 'number' },
        totalScore: { type: 'number' },
        percentageScore: { type: 'number' },
        questionResults: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              isCorrect: { type: 'boolean' },
              score: { type: 'number' },
              reason: { type: 'string' }
            }
          }
        },
        submittedAt: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        endedAt: { type: 'string', format: 'date-time' },
        duration: { type: 'number' },
        questionIds: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Test or user not found' })
  async createTestExam(@Body() body: { testId: string }, @Request() req): Promise<TestResult> {
    const userId = req.user.id;
    return this.testResultsService.createTestExam(body.testId, userId);
  }
  @Get()
  @ApiOperation({ summary: 'Get all test results' })
  @ApiResponse({
    status: 200,
    description: 'All test results retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          test: {
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
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' }
            }
          },
          answers: { type: 'object' },
          score: { type: 'number' },
          totalScore: { type: 'number' },
          percentageScore: { type: 'number' },
          questionResults: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                isCorrect: { type: 'boolean' },
                score: { type: 'number' },
                reason: { type: 'string' }
              }
            }
          },
          submittedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          endedAt: { type: 'string', format: 'date-time' },
          duration: { type: 'number' },
          questionIds: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'No test results found' })
  async findAll() {
    return this.testResultsService.findAll();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get test history for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of test results for the user',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          test: {
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
          },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' }
            }
          },
          answers: { type: 'object' },
          score: { type: 'number' },
          totalScore: { type: 'number' },
          percentageScore: { type: 'number' },
          questionResults: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                isCorrect: { type: 'boolean' },
                score: { type: 'number' },
                reason: { type: 'string' },
                questionText: { type: 'string' },
                questionType: { type: 'string' },
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
                correctAnswer: { type: 'string', nullable: true },
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
          },
          submittedAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          endedAt: { type: 'string', format: 'date-time' },
          duration: { type: 'number' },
          questionIds: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserTestHistory(@Request() req): Promise<TestResult[]> {
    const userId = req.user.id;
    return this.testResultsService.findByUser(userId);
  }

  @Get(':id/unsubmitted')
  @ApiOperation({ summary: 'Get unsubmitted test result for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Unsubmitted test result retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUnsubmittedTestResult(@Param('id') testId: string, @Request() req): Promise<boolean> {
    const userId = req.user.id;
    return this.testResultsService.getUnsubmittedTestResult (testId, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test result by ID' })
  @ApiParam({ name: 'id', description: 'Test result ID' })
  @ApiResponse({
    status: 200,
    description: 'Test result retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        test: {
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
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        answers: { type: 'object' },
        score: { type: 'number' },
        totalScore: { type: 'number' },
        percentageScore: { type: 'number' },
        questionResults: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              isCorrect: { type: 'boolean' },
              score: { type: 'number' },
              reason: { type: 'string' }
            }
          }
        },
        submittedAt: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        endedAt: { type: 'string', format: 'date-time' },
        duration: { type: 'number' },
        questionIds: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Test result not found' })
  async findOne(@Param('id') id: string) {
    return this.testResultsService.findOne(id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit answers for a test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({
    status: 201,
    description: 'Test answers submitted successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        test: {
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
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        answers: { type: 'object' },
        score: { type: 'number' },
        totalScore: { type: 'number' },
        percentageScore: { type: 'number' },
        questionResults: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              isCorrect: { type: 'boolean' },
              score: { type: 'number' },
              reason: { type: 'string' }
            }
          }
        },
        submittedAt: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        endedAt: { type: 'string', format: 'date-time' },
        duration: { type: 'number' },
        questionIds: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Test or user not found' })
  async submitAnswers(
    @Param('id') testResultId: string,
     @Body() body: { answers: Record<string, any> },
    @Request() req,
  ): Promise<TestResult> {
      const userId = req.user.id;
      return this.testResultsService.submitAnswers(testResultId, userId, body);
  }

  @Put(':id/save')
  @ApiOperation({ summary: 'Save answers for a test without submitting' })
  @ApiParam({ name: 'id', description: 'Test result ID' })
  @ApiResponse({
    status: 200,
    description: 'Answers saved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        test: {
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
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        answers: { type: 'object' },
        score: { type: 'number' },
        totalScore: { type: 'number' },
        percentageScore: { type: 'number' },
        questionResults: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              questionId: { type: 'string' },
              isCorrect: { type: 'boolean' },
              score: { type: 'number' },
              reason: { type: 'string' }
            }
          }
        },
        submittedAt: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        endedAt: { type: 'string', format: 'date-time' },
        duration: { type: 'number' },
        questionIds: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Test result not found' })
  @ApiResponse({ status: 400, description: 'Cannot save answers for submitted test' })
  async saveAnswers(
    @Param('id') testResultId: string,
    @Body() body: { answers: Record<string, any> },
    @Request() req,
  ): Promise<TestResult> {
    const userId = req.user.id;
    return this.testResultsService.saveAnswers(testResultId, userId, body);
  }
}