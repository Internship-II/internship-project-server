import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Test } from '../tests/entities/test.entity';
import { Question } from '../questions/entities/question.entity';
import { TestResult } from '../test-results/entities/test-result.entity';
import { SubjectType } from 'src/types/questions';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Test)
    private readonly testsRepository: Repository<Test>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(TestResult)
    private readonly testResultsRepository: Repository<TestResult>,
  ) {}

  async getDashboardStats() {
    // Get total users
    const totalUsers = await this.usersRepository.count(
      {
        where: {
          role: 'student'
        }
      }
    );
    const totalFemaleUsers = await this.usersRepository.count({
      where: { 
        gender: 'female',
        role: 'student'
      }
    });
    const totalMaleUsers = await this.usersRepository.count({
      where: { 
        gender: 'male',
        role: 'student'
      }
    });
    const totalOtherUsers = await this.usersRepository.count({
      where: { 
        gender: 'not_to_say',
        role: 'student'
      }
    });
    // Get total tests
    const totalTests = await this.testsRepository.count();

    // Get question bank stats by subject
    const questionStats = await this.questionsRepository
      .createQueryBuilder('question')
      .select('question.subject', 'subject')
      .addSelect('COUNT(*)', 'count')
      .groupBy('question.subject')
      .getRawMany();
 
  // // Get average of max scores per user by subject
  // const subjectStats = await this.testResultsRepository
  // .createQueryBuilder('testResult')
  // .leftJoin('testResult.test', 'test')
  // .leftJoin('testResult.user', 'user')
  // .select('test.subject', 'subject')
  // .addSelect(
  //   `(
  //     SELECT AVG(maxScore)
  //     FROM (
  //       SELECT MAX(tr."percentageScore") as maxScore
  //       FROM test_results tr
  //       INNER JOIN tests t ON tr."testId" = t.id
  //       WHERE tr."submittedAt" IS NOT NULL
  //       AND t.subject = test.subject
  //       GROUP BY tr."userId"
  //     ) maxScores
  //   )`,
  //   'averageScore'
  // )
  // .addSelect('COUNT(*)', 'submissionCount')
  // .where('testResult.submittedAt IS NOT NULL')
  // .groupBy('test.subject')
  // .getRawMany();

  // // Format the results
  // const averageScores = subjectStats.map(stat => ({
  // subject: stat.subject,
  // averageScore: parseFloat((parseFloat(stat.averageScore) || 0).toFixed(2)),
  // submissionCount: parseInt(stat.submissionCount) || 0
  // })); 
    // Format the data
    const questionBankStats = questionStats.map(stat => ({
      subject: stat.subject,
      count: parseInt(stat.count)
    }));
    // Get average of max scores per user by subject + overall best score
  const subjectStats = await this.testResultsRepository
    .createQueryBuilder('testResult')
    .leftJoin('testResult.test', 'test')
    .leftJoin('testResult.user', 'user')
    .select('test.subject', 'subject')
    .addSelect(
      `(
        SELECT AVG(maxScore)
        FROM (
          SELECT MAX(tr."percentageScore") as maxScore
          FROM test_results tr
          INNER JOIN tests t ON tr."testId" = t.id
          WHERE tr."submittedAt" IS NOT NULL
          AND t.subject = test.subject
          GROUP BY tr."userId"
        ) maxScores
      )`,
      'averageScore'
    )
    .addSelect('COUNT(*)', 'submissionCount')
    .addSelect('MAX("testResult"."percentageScore")', 'bestScore')
    .where('testResult.submittedAt IS NOT NULL')
    .groupBy('test.subject')
    .getRawMany();

  // Format results
  const scores = subjectStats.map(stat => ({
    subject: stat.subject,
    averageScore: parseFloat((parseFloat(stat.averageScore) || 0).toFixed(2)),
    submissionCount: parseInt(stat.submissionCount) || 0,
    bestScore: parseFloat(stat.bestScore) || 0
  }));
  const totalTestsTaken = await this.testResultsRepository.count({
    where: {
      submittedAt: Not(IsNull())
    }
  });

    return {
      totalUsers,
      totalFemaleUsers,
      totalMaleUsers,
      totalOtherUsers,
      totalTests,
      totalTestsTaken,
      questionBank: {
        totalQuestions: questionBankStats.reduce((sum, stat) => sum + stat.count, 0),
        bySubject: questionBankStats
      }, 
      scores
    };
  }

  async getSubjectStats() {
    // Get detailed stats for each subject
    const subjects = Object.values(SubjectType);
    const subjectStats: Array<{
      subject: SubjectType;
      questionCount: number;
      testCount: number;
      averageScore: number;
      submissionCount: number;
    }> = [];

    for (const subject of subjects) {
      // Get question count for this subject
      const questionCount = await this.questionsRepository.count({
        where: { subject }
      });

      // Get test count for this subject
      const testCount = await this.testsRepository.count({
        where: { subject }
      });

      // Get average score and submission count for this subject
      const scoreStats = await this.testResultsRepository
        .createQueryBuilder('testResult')
        .leftJoin('testResult.test', 'test')
        .select('AVG(testResult.percentageScore)', 'averageScore')
        .addSelect('COUNT(*)', 'submissionCount')
        .where('test.subject = :subject', { subject })
        .andWhere('testResult.submittedAt IS NOT NULL')
        .getRawOne();

      subjectStats.push({
        subject,
        questionCount,
        testCount,
        averageScore: parseFloat((parseFloat(scoreStats?.averageScore) || 0).toFixed(2)),
        submissionCount: parseInt(scoreStats?.submissionCount) || 0
      });
    }

    return subjectStats;
  }

  async getRoleBasedStats() {
    // Get stats by user role
    const roleStats = await this.testResultsRepository
      .createQueryBuilder('testResult')
      .leftJoin('testResult.test', 'test')
      .leftJoin('testResult.user', 'user')
      .select('user.role', 'role')
      .addSelect('test.subject', 'subject')
      .addSelect('AVG(testResult.percentageScore)', 'averageScore')
      .addSelect('COUNT(*)', 'submissionCount')
      .where('testResult.submittedAt IS NOT NULL')
      .groupBy('user.role')
      .addGroupBy('test.subject')
      .getRawMany();

    // Group by role and subject
    const groupedStats = {};
    roleStats.forEach(stat => {
      const role = stat.role || 'student';
      const subject = stat.subject;
      
      if (!groupedStats[role]) {
        groupedStats[role] = {};
      }
      
      groupedStats[role][subject] = {
        averageScore: parseFloat((parseFloat(stat.averageScore) || 0).toFixed(2)),
        submissionCount: parseInt(stat.submissionCount) || 0
      };
    });

    return groupedStats;
  }

  async getComprehensiveStats() {
    const [dashboardStats, subjectStats, roleStats] = await Promise.all([
      this.getDashboardStats(),
      this.getSubjectStats(),
      this.getRoleBasedStats()
    ]);

    return {
      ...dashboardStats,
      subjectStats,
      roleStats
    };
  }
} 