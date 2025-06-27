// src/test-results/test-result.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Test } from '../../tests/entities/test.entity';
import { User } from '../../users/entities/user.entity';
import { QuestionResult } from 'src/types/question-result';

@Entity({ name: 'test_results' })
export class TestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Test)
  test: Test;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'jsonb' })
  answers: Record<string, any>; // Answers by question ID

  @Column({ type: 'float' })
  score: number;

  @Column({ type: 'float' })
  totalScore: number;

  @Column({ type: 'float' })
  percentageScore: number;

  @Column({ type: 'jsonb' })
  questionResults: QuestionResult[];

  @Column()
  submittedAt: Date;
}