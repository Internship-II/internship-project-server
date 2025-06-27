import { Question } from 'src/modules/questions/entities/question.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToMany } from 'typeorm';

@Entity({ name: 'tests' })
export class Test {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  subject: string;

  @Column()
  duration: string;

  @Column({ type: 'int' })
  numOfQuestion: number;

  @Column({ type: 'int' })
  questionPerPage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @ManyToMany(() => Question)
  // @JoinTable({ name: 'test_questions' }) // Custom table name
  // questions: Question[]; // Relationship to questions
} 