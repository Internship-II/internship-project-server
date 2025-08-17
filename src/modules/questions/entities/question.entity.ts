import { QuestionType, SubjectType } from 'src/types/questions';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
 
@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne('Test', 'questions')
  test: any;

  @Column({
    type: 'enum',
    enum: SubjectType
  })
  subject: SubjectType;

  @Column({
    type: 'enum',
    enum: QuestionType
  })
  type: QuestionType;

  @Column()
  questionText: string;

  @Column({ nullable: true })
  questionImage: string;

  @Column()
  correctAnswer: string;

  @Column('jsonb', { nullable: true })
  choices: { text: string | null; image: string | null; isCorrect: boolean }[];

  @Column('jsonb', { nullable: true })
  matchingPairs: { question: string; answer: string }[];

  @Column('jsonb', { nullable: true })
  blanks: { answer: string }[];

  @Column({ type: 'float' })
  score: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  deletedAt: Date;
}