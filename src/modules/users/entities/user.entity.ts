import { TestResult } from "src/modules/test-results/entities/test-result.entity"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column({ default: "student" })
  role: string

  @Column()
  gender: string

  @Column()
  educationLevel: string

  @Column()
  province: string

  @Column({ default: false })
  isEmailVerified: boolean

  @Column({ nullable: true, type: 'varchar' })
  verificationToken: string | null

  @Column({ nullable: true, type: 'timestamp' })
  verificationTokenExpiry: Date | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  
  @OneToMany(() => TestResult, testResult => testResult.user, { cascade: true })
  testResults: TestResult[];
}
