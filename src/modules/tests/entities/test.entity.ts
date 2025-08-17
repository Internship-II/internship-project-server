import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity({ name: 'tests' })
export class Test {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  subject: string;

  @Column({ type: 'int' }) 
  duration: number;

  @Column({ type: 'int' })
  numOfQuestion: number;

  @Column({ type: 'int' })
  questionPerPage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  deletedAt: Date;

  @OneToMany('Question', 'test')
  questions: any[];
} 