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


import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TestResultsService } from './test-results.service';
import { TestResult } from './entities/test-result.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Test Results')
@ApiBearerAuth()
@Controller('tests')
@UseGuards(AuthGuard('jwt'))
export class TestResultsController {
  constructor(private readonly testResultsService: TestResultsService) {}

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
            duration: { type: 'string' },
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
        submittedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Test or user not found' })
  async submitAnswers(
    @Param('id') testId: string,
    @Body() body: { answers: Record<string, any>, questionIds: string[] },
    @Request() req,
  ): Promise<TestResult> {
    const userId = req.user.id; // From JWT payload
    return this.testResultsService.submitAnswers(testId, userId, body);
  }

  @Get('results/user')
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
              duration: { type: 'string' },
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
          submittedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserTestHistory(@Request() req): Promise<TestResult[]> {
    const userId = req.user.id; // From JWT payload
    return this.testResultsService.findByUser(userId);
  }
}