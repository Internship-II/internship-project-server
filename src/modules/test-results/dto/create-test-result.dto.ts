import { IsString, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestResultDto {
  @ApiProperty({ description: 'ID of the test' })
  @IsUUID()
  testId: string;

  @ApiProperty({ description: 'ID of the user taking the test' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Ended at (default: null)', default: null })
  @IsOptional()
  endedAt?: Date | null;

  @ApiProperty({ description: 'Created at (default: null)', default: null })
  @IsOptional()
  createdAt?: Date | null;
}
