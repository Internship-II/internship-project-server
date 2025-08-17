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


import { Controller, Post, Get, Body, Param, Request, Put, Query, Delete, ValidationPipe, UsePipes, HttpException, HttpStatus } from '@nestjs/common';
import { TestResultsService } from './test-results.service';
import { TestResult } from './entities/test-result.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { LandingPageDataDto, SubjectLeaderboardDto, UserImprovementDto } from './dto/landing-page.dto';
import { LeaderboardQueryDto, LeaderboardQueryPaginationDto, TopPerformersQueryDto, UserPerformanceQueryDto } from 'src/modules/test-results/dto/leaderboard-query.dto';

@ApiTags('Test Results')
@ApiBearerAuth()
@Controller('test-results')
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
  async getUserTestHistory(@Request() req):  Promise<TestResult[]> {
    const userId = req.user.id;
    return this.testResultsService.findByUser(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get test results for a specific user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Test results for the user retrieved successfully',
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
  async getUserTestResults(@Param('userId') userId: string) {
    return this.testResultsService.findByUserwithTotalTestTaken(userId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard with different sorting options' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rank: { type: 'number' },
          userId: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          testId: { type: 'string' },
          testSubject: { type: 'string' },
          score: { type: 'number' },
          totalScore: { type: 'number' },
          percentageScore: { type: 'number' },
          duration: { type: 'number' },
          durationFormatted: { type: 'string' },
          submittedAt: { type: 'string', format: 'date-time' },
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
          }
        }
      }
    }
  })
  async getLeaderboard(
    @Request() req,
    @Query('testId') testId?: string,
    @Query('sortBy') sortBy?: 'percentageScore' | 'score' | 'duration',
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<any[]> {
    const defaultLimit = 10;
    const maxLimit = 100;
    
    // Validate and sanitize limit
    const sanitizedLimit = limit 
      ? Math.min(Math.max(limit, 1), maxLimit) 
      : defaultLimit;

    return this.testResultsService.getLeaderboard(
      testId,
      sortBy || 'percentageScore',
      sanitizedLimit
    );
  }
  
  @Get('leaderboard-pagination')
  @ApiOperation({ summary: 'Get leaderboard by subject with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        entries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              rank: { type: 'number' },
              userId: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string' },
              testId: { type: 'string' },
              testSubject: { type: 'string' },
              score: { type: 'number' },
              totalScore: { type: 'number' },
              percentageScore: { type: 'number' },
              duration: { type: 'number' },
              durationFormatted: { type: 'string' },
              submittedAt: { type: 'string', format: 'date-time' },
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
              numOfQuestion: { type: 'number' },
              testDuration: { type: 'number' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number' },
            totalPages: { type: 'number' },
            totalCount: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
            limit: { type: 'number' }
          }
        }
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLeaderboardBySubjectWithPagination(
    @Request() req,
    @Query('subject') subject: string,
    @Query() query: LeaderboardQueryPaginationDto
  ): Promise<{
    entries: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
      limit: number;
    };
  }> {
    const defaultLimit = 10;
    const maxLimit = 100;
    const sanitizedLimit = query.limit ? Math.min(Math.max(query.limit, 1), maxLimit) : defaultLimit;

    if (!subject) {
      throw new HttpException('Subject is required', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.testResultsService.getLeaderboardBySubjectWithPagination(
        subject,
        query.sortBy,
        query.dateFilter,
        query.page,
        sanitizedLimit
      );
    } catch (error) {
      throw new HttpException(
        `Failed to fetch leaderboard for subject: ${subject}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('subjects')
  @ApiOperation({ summary: 'Get all available test subjects' })
  @ApiResponse({
    status: 200,
    description: 'List of available subjects',
    schema: {
      type: 'array',
      items: { type: 'string' }
    }
  })
  async getAvailableSubjects(@Request() req): Promise<string[]> {
    try {
      return await this.testResultsService.getAvailableSubjects();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch available subjects',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user performance statistics' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiResponse({
    status: 200,
    description: 'User performance statistics',
    schema: {
      type: 'object',
      properties: {
        userEntries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              username: { type: 'string' },
              email: { type: 'string' },
              testId: { type: 'string' },
              testSubject: { type: 'string' },
              score: { type: 'number' },
              totalScore: { type: 'number' },
              percentageScore: { type: 'number' },
              duration: { type: 'number' },
              submittedAt: { type: 'string', format: 'date-time' },
              numOfQuestion: { type: 'number' },
              testDuration: { type: 'number' }
            }
          }
        },
        userBestPerformance: {
          type: 'object',
          nullable: true,
          properties: {
            userId: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            testId: { type: 'string' },
            testSubject: { type: 'string' },
            score: { type: 'number' },
            totalScore: { type: 'number' },
            percentageScore: { type: 'number' },
            duration: { type: 'number' },
            submittedAt: { type: 'string', format: 'date-time' },
            numOfQuestion: { type: 'number' },
            testDuration: { type: 'number' }
          }
        },
        userAverageScore: { type: 'number' },
        userBestRank: { type: 'number', nullable: true },
        totalTests: { type: 'number' },
        subjectStats: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              totalTests: { type: 'number' },
              bestScore: { type: 'number' },
              averageScore: { type: 'number' },
              bestResult: {
                type: 'object',
                properties: {
                  testId: { type: 'string' },
                  score: { type: 'number' },
                  totalScore: { type: 'number' },
                  percentageScore: { type: 'number' },
                  duration: { type: 'number' },
                  submittedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserPerformance(
    @Request() req,
    @Param('userId') userId: string,
    @Query() query: UserPerformanceQueryDto
  ): Promise<{
    userEntries: any[];
    userBestPerformance: any | null;
    userAverageScore: number;
    userBestRank: number | null;
    totalTests: number;
    subjectStats: Record<string, any>;
  }> {
    try {
      return await this.testResultsService.getUserPerformance(userId, query.subject);
    } catch (error) {
      throw new HttpException(
        `Failed to fetch user performance for user: ${userId}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Get top performers across all subjects' })
  @ApiResponse({
    status: 200,
    description: 'Top performers retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rank: { type: 'number' },
          userId: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          testSubject: { type: 'string' },
          percentageScore: { type: 'number' },
          duration: { type: 'number' },
          submittedAt: { type: 'string', format: 'date-time' },
          score: { type: 'number' },
          totalScore: { type: 'number' }
        }
      }
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTopPerformers(
    @Request() req,
    @Query() query: TopPerformersQueryDto
  ): Promise<any[]> {
    const defaultLimit = 10;
    const maxLimit = 100;
    const sanitizedLimit = query.limit ? Math.min(Math.max(query.limit, 1), maxLimit) : defaultLimit;

    try {
      return await this.testResultsService.getTopPerformersAllSubjects(sanitizedLimit);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch top performers',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get leaderboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalSubmissions: { type: 'number' },
        totalUsers: { type: 'number' },
        subjectStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              subject: { type: 'string' },
              totalSubmissions: { type: 'number' },
              averageScore: { type: 'number' },
              highestScore: { type: 'number' },
              uniqueUsers: { type: 'number' }
            }
          }
        }
      }
    }
  })
  async getLeaderboardStats(@Request() req): Promise<{
    totalSubmissions: number;
    totalUsers: number;
    subjectStats: any[];
  }> {
    try {
      return await this.testResultsService.getLeaderboardStats();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch leaderboard statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a test result from history' })
  @ApiParam({ name: 'id', description: 'Test result ID' })
  @ApiResponse({
    status: 200,
    description: 'Test result deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedTestResult: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            testSubject: { type: 'string' },
            score: { type: 'number' },
            percentageScore: { type: 'number' },
            submittedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Test result not found or permission denied' })
  @ApiResponse({ status: 400, description: 'Cannot delete test result' })
  async deleteTestResult(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.testResultsService.deleteTestResult(id, userId);
  }

  // Public endpoints for guest users (landing page data)
  @Get('public/leaderboard-by-subject')
  @Public()
  @ApiOperation({ summary: 'Get top 10 leaderboard for each subject (Public - no auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard by subject retrieved successfully',
    type: [SubjectLeaderboardDto]
  })
  async getLeaderboardBySubject(): Promise<SubjectLeaderboardDto[]> {
    return this.testResultsService.getLeaderboardBySubject(10);
  }

  @Get('public/active-users')
  @Public()
  @ApiOperation({ summary: 'Get count of active users in last 30 days (Public - no auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Active user count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        activeUserCount: { type: 'number' },
        days: { type: 'number' }
      }
    }
  })
  async getActiveUserCount(): Promise<{ activeUserCount: number; days: number }> {
    const activeUserCount = await this.testResultsService.getActiveUserCount(30);
    return { activeUserCount, days: 30 };
  }

  @Get('public/student-improvement')
  @Public()
  @ApiOperation({ summary: 'Get student improvement statistics (Public - no auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Student improvement statistics retrieved successfully',
    type: UserImprovementDto
  })
  async getStudentImprovementStats(): Promise<UserImprovementDto> {
    return this.testResultsService.getStudentImprovementStats();
  }

  @Get('public/landing-page-data')
  @Public()
  @ApiOperation({ summary: 'Get all landing page data (Public - no auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Landing page data retrieved successfully',
    type: LandingPageDataDto
  })
  async getLandingPageData(): Promise<LandingPageDataDto> {
    return this.testResultsService.getLandingPageData();
  }
  
  @Get('public/total-tests-taken')
  @Public()
  @ApiOperation({ summary: 'Get total tests taken (Public - no auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Total tests taken retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalTests: { type: 'number' }
      }
    }
  })
  async getTotalTestsTaken(): Promise<{ totalTests: number }> {
    const totalTests = await this.testResultsService.getTotalTestsTaken();
    return { totalTests };
  }


  

}