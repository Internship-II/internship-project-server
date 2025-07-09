import { IsOptional, IsString, IsNumber, IsIn, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

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