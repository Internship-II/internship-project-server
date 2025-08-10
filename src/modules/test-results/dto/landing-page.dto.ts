import { ApiProperty } from '@nestjs/swagger';

export class SubjectLeaderboardDto {
  @ApiProperty({ description: 'Subject name' })
  subject: string;

  @ApiProperty({ description: 'Top 10 leaderboard for this subject', type: 'array' })
  leaderboard: any[];
}

export class UserImprovementDto {
  @ApiProperty({ description: 'Average improvement in percentage score' })
  averageImprovement: number;

  @ApiProperty({ description: 'Number of users with improvement data' })
  usersWithImprovement: number;

  @ApiProperty({ description: 'Percentage of users who improved' })
  improvementPercentage: number;
}

export class LandingPageDataDto {
  @ApiProperty({ description: 'Top 10 leaderboard per subject', type: [SubjectLeaderboardDto] })
  leaderboardBySubject: SubjectLeaderboardDto[];

  @ApiProperty({ description: 'Number of active users (users who took tests in last 30 days)' })
  activeUserCount: number;

  @ApiProperty({ description: 'Student improvement statistics', type: UserImprovementDto })
  studentImprovement: UserImprovementDto;

  @ApiProperty({ description: 'Total number of registered users' })
  totalUsers: number;

  @ApiProperty({ description: 'Total number of tests taken' })
  totalTestsTaken: number;
  
}