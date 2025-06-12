import { IsString, IsArray, IsOptional, ValidateNested, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType, SubjectType } from 'src/types/questions';
  

export class ChoiceDto {
  @ApiProperty({ description: 'Text for the choice' })
  @IsString()
  text: string | null;

  @ApiProperty({ description: 'Image path for the choice', required: false })
  @IsString()
  @IsOptional()
  image: string | null;

  @ApiProperty({ description: 'Indicates if this choice is the correct answer' })
  isCorrect: boolean;
}

export class MatchingPairDto {
  @ApiProperty({ description: 'Question part of the matching pair' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'Answer part of the matching pair' })
  @IsString()
  answer: string;
}

export class BlankDto {
  @ApiProperty({ description: 'Answer for the blank' })
  @IsString()
  answer: string;
}

export class CreateQuestionDto {
  @ApiProperty({ description: 'Subject of the question', enum: SubjectType })
  @IsEnum(SubjectType)
  subject: SubjectType;

  @ApiProperty({ description: 'Type of the question', enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ description: 'Text content of the question' })
  @IsString()
  questionText: string;

  @ApiProperty({ description: 'Image for the question', required: false })
  @IsString()
  @IsOptional()
  questionImage?: string;

  @ApiProperty({ description: 'Correct answer for True/False, Yes/No, or MCQ' })
  @IsString()
  correctAnswer: string;

  @ApiProperty({ description: 'Score for the question', default: 4.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  score: number;

  @ApiProperty({ description: 'Choices for MCQ questions', type: [ChoiceDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  @IsOptional()
  choices?: ChoiceDto[];

  @ApiProperty({ description: 'Matching pairs for Matching questions', type: [MatchingPairDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchingPairDto)
  @IsOptional()
  matchingPairs?: MatchingPairDto[];

  @ApiProperty({ description: 'Answers for Fill in Blank questions', type: [BlankDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlankDto)
  @IsOptional()
  blanks?: BlankDto[];
}