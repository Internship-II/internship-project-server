import { IsOptional, IsString, IsNumber, IsIn, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional, ApiQuery } from '@nestjs/swagger';

export class LeaderboardQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by specific test ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsString()
  testId?: string;

  @ApiPropertyOptional({ 
    description: 'Sort by criteria',
    enum: ['percentageScore', 'score', 'duration'],
    default: 'percentageScore'
  })
  @IsOptional()
  @IsIn(['percentageScore', 'score', 'duration'])
  sortBy?: 'percentageScore' | 'score' | 'duration';

  @ApiPropertyOptional({ 
    description: 'Number of results to return (1-100)',
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class LeaderboardQueryPaginationDto {
    @ApiPropertyOptional({ name: 'sortBy', enum: ['percentageScore', 'score', 'duration'], required: false })
  sortBy?: 'percentageScore' | 'score' | 'duration' = 'percentageScore';

  @ApiPropertyOptional({ name: 'dateFilter', enum: ['all', 'today', 'week', 'month', 'year'], required: false })
  dateFilter?: string = 'all';

  @ApiPropertyOptional({ name: 'page', type: Number, required: false })
  page?: number = 1;

  @ApiPropertyOptional({ name: 'limit', type: Number, required: false })
  limit?: number = 10;
}

export class UserPerformanceQueryDto {
  @ApiPropertyOptional({ name: 'subject', type: String, required: false })
  subject?: string;
}
export class TopPerformersQueryDto {
  @ApiPropertyOptional({ name: 'limit', type: Number, required: false })
  limit?: number = 10;
}