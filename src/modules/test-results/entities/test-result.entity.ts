// src/test-results/test-result.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { QuestionResult } from 'src/types/question-result';

@Entity({ name: 'test_results' })
export class TestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne('Test', 'testResults')
  test: any;

  @ManyToOne('User', 'testResults', { 
    onDelete: 'CASCADE' // Automatically delete test results when user is deleted
  })
  user: any;
  
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

  @Column({ type: 'jsonb', nullable: true })
  questionIds: string[]; // Array of question IDs for this test attempt

  @Column({ type: 'timestamp with time zone', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endedAt: Date | null;
  
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'int'})
  duration: number ; // Duration in seconds (e.g., 1230 for 20 minutes 30 seconds)
}