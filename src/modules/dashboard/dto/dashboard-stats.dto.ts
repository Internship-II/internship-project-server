import { ApiProperty } from '@nestjs/swagger';

export class QuestionBankStatsDto {
  @ApiProperty()
  totalQuestions: number;

  @ApiProperty({ type: [Object] })
  bySubject: Array<{
    subject: string;
    count: number;
  }>;
}

export class AverageScoreDto {
  @ApiProperty()
  subject: string;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  submissionCount: number;
}

export class SubjectStatsDto {
  @ApiProperty()
  subject: string;

  @ApiProperty()
  questionCount: number;

  @ApiProperty()
  testCount: number;

  @ApiProperty()
  averageScore: number;

  @ApiProperty()
  submissionCount: number;
}

export class RoleStatsDto {
  @ApiProperty()
  role: string;

  @ApiProperty({ type: Object })
  subjects: Record<string, {
    averageScore: number;
    submissionCount: number;
  }>;
}

export class DashboardStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalTests: number;

  @ApiProperty()
  questionBank: QuestionBankStatsDto;

  @ApiProperty({ type: [AverageScoreDto] })
  averageScores: AverageScoreDto[];
}

export class ComprehensiveDashboardDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalTests: number;

  @ApiProperty()
  questionBank: QuestionBankStatsDto;

  @ApiProperty({ type: [AverageScoreDto] })
  averageScores: AverageScoreDto[];

  @ApiProperty({ type: [SubjectStatsDto] })
  subjectStats: SubjectStatsDto[];

  @ApiProperty({ type: Object })
  roleStats: Record<string, Record<string, {
    averageScore: number;
    submissionCount: number;
  }>>;
} 