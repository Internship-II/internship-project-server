// import { IsString, IsInt, Min, IsArray, IsOptional, IsString as IsStringArray } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class CreateTestDto {
//   @ApiProperty({ description: 'Subject of the test' })
//   @IsString()
//   subject: string;

//   @ApiProperty({ description: 'Duration of the test' })
//   @IsString()
//   duration: string;

//   @ApiProperty({ description: 'Number of questions in the test' })
//   @IsInt()
//   @Min(1)
//   numOfQuestion: number;

//   @ApiProperty({ description: 'Number of questions per page' })
//   @IsInt()
//   @Min(1)
//   questionPerPage: number;

//   @ApiProperty({ 
//     description: 'Array of question IDs to assign to the test',
//     type: [String],
//     required: false,
//     example: ['question-id-1', 'question-id-2']
//   })
//   @IsOptional()
//   @IsArray()
//   @IsStringArray({ each: true })
//   questionIds?: string[];
// } 


import { IsString, IsInt, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTestDto {
  @ApiProperty({ description: 'Subject of the test' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Duration of the test' })
  @IsInt()
  duration: number;

  @ApiProperty({ description: 'Number of questions in the test' })
  @IsInt()
  @Min(1)
  numOfQuestion: number;

  @ApiProperty({ description: 'Number of questions per page' })
  @IsInt()
  @Min(1)
  questionPerPage: number;
}
