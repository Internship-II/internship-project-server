import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCurrentPasswordDto {
  @ApiProperty({ description: 'Current password to verify', example: 'currentPassword123' })
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString()
  currentPassword: string;
} 