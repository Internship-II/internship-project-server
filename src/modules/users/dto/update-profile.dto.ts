import { IsOptional, IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'User name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'User gender', example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Education level', example: 'Bachelor' })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiPropertyOptional({ description: 'Province', example: 'Gauteng' })
  @IsOptional()
  @IsString()
  province?: string;
} 