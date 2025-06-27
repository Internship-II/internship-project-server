// import { IsString, IsInt, Min, IsArray, IsOptional, IsString as IsStringArray } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class UpdateTestDto {
//   @ApiProperty({ description: 'Subject of the test', required: false })
//   @IsString()
//   @IsOptional()
//   subject?: string;

//   @ApiProperty({ description: 'Duration of the test', required: false })
//   @IsString()
//   @IsOptional()
//   duration?: string;

//   @ApiProperty({ description: 'Number of questions in the test', required: false })
//   @IsInt()
//   @Min(1)
//   @IsOptional()
//   numOfQuestion?: number;

//   @ApiProperty({ description: 'Number of questions per page', required: false })
//   @IsInt()
//   @Min(1)
//   @IsOptional()
//   questionPerPage?: number;

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




import { IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTestDto {
  @ApiProperty({ description: 'Subject of the test', required: false })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Duration of the test', required: false })
  @IsString()
  @IsOptional()
  duration?: string;

  @ApiProperty({ description: 'Number of questions in the test', required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  numOfQuestion?: number;

  @ApiProperty({ description: 'Number of questions per page', required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  questionPerPage?: number;
}