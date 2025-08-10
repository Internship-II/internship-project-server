import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Not } from 'typeorm';
import { TestResult } from './entities/test-result.entity';
import { Test } from '../tests/entities/test.entity';
import { User } from '../users/entities/user.entity';    
import { Question } from '../questions/entities/question.entity';
import { QuestionType } from 'src/types/questions';
import { QuestionResult } from 'src/types/question-result';

@Injectable()
export class TestResultsService {
  constructor(
    @InjectRepository(TestResult)
    private testResultRepository: Repository<TestResult>,
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async findByUserwithTotalTestTaken(userId: string) {
    console.log('=== DEBUG: findByUser called ===');
    console.log('userId:', userId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const testResults = await this.testResultRepository.find({
      where: {         user: { id: userId }    },
      relations: ['test', 'user'],
      order: { submittedAt: 'DESC' },
    });

    const totalTestsTaken = await this.testResultRepository.count({
      where: {
        user: { id: userId },
        submittedAt: Not(IsNull())
      }
    })

    console.log('testResults found:', testResults.length);

    // Fetch question details for each test result
    for (const result of testResults) {
      const questionIds = result.questionResults.map(qr => qr.questionId);
      const questions = await this.questionRepository.findBy({ 
        id: In(questionIds),
        isActive: true 
      });
      console.log(`Questions for test result ${result.id}:`, questions.map(q => ({ id: q.id, questionText: q.questionText })));

      // Attach question details to questionResults
      result.questionResults = result.questionResults.map(qr => {
        const question = questions.find(q => q.id === qr.questionId);
        return {
          ...qr,
          questionText: question ? question.questionText : 'Question not found',
          questionType: question ? question.type : 'Unknown',
          choices: question ? question.choices : [],
          correctAnswer: question ? question.correctAnswer : null,
          matchingPairs: question ? question.matchingPairs : [],
          blanks: question ? question.blanks : [],
        };
      });
    }

    return {
      testResults,
      totalTestsTaken,
    };
  }

  async findByUser(userId: string): Promise<TestResult[]> {
    console.log('=== DEBUG: findByUser called ===');
    console.log('userId:', userId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const testResults = await this.testResultRepository.find({
      where: { user: { id: userId } },
      relations: ['test', 'user'],
      order: { submittedAt: 'DESC' },
    }); 

    console.log('testResults found:', testResults.length);

    // Fetch question details for each test result
    for (const result of testResults) {
      const questionIds = result.questionResults.map(qr => qr.questionId);
      const questions = await this.questionRepository.findBy({ 
        id: In(questionIds),
        isActive: true 
      });
      console.log(`Questions for test result ${result.id}:`, questions.map(q => ({ id: q.id, questionText: q.questionText })));

      // Attach question details to questionResults
      result.questionResults = result.questionResults.map(qr => {
        const question = questions.find(q => q.id === qr.questionId);
        return {
          ...qr,
          questionText: question ? question.questionText : 'Question not found',
          questionType: question ? question.type : 'Unknown',
          choices: question ? question.choices : [],
          correctAnswer: question ? question.correctAnswer : null,
          matchingPairs: question ? question.matchingPairs : [],
          blanks: question ? question.blanks : [],
        };
      });
    }

    return testResults;
  }
  async findAll() {
    return this.testResultRepository.find();
  }
  async findOne(id: string) {
    const testResult = await this.testResultRepository.findOne({ where: { id }, relations: ['test'] });
    
    if (!testResult) {
      throw new NotFoundException(`Test result with ID ${id} not found`);
    }

    return { ...testResult };
  }
  
  async findUserTotalTestsTaken(id: string){
    const totalTestsTaken = await this.testResultRepository.count({
      where: {
        id,
        submittedAt: Not(IsNull())
      }
    })
    if(!totalTestsTaken){
      throw new NotFoundException(`Total Test Taken with ID ${id} not found`);
    }
    return totalTestsTaken;
  }

  async deleteTestResult(id: string, userId: string) {
    console.log('=== DEBUG: deleteTestResult called ===');
    console.log('testResultId:', id);
    console.log('userId:', userId);

    const testResult = await this.testResultRepository.findOne({ 
      where: { id, user: { id: userId } }, 
      relations: ['test', 'user'] 
    });

    if (!testResult) {
      throw new NotFoundException(`Test result with ID ${id} not found or you don't have permission to delete it`);
    }

    // Check if the test result belongs to the requesting user
    if (testResult.user.id !== userId) {
      throw new BadRequestException('You can only delete your own test results');
    }

    await this.testResultRepository.remove(testResult);
    
    console.log('Test result deleted successfully');
    return { 
      message: `Test result for ${testResult.test.subject} test deleted successfully`,
      deletedTestResult: {
        id: testResult.id,
        testSubject: testResult.test.subject,
        score: testResult.score,
        percentageScore: testResult.percentageScore,
        submittedAt: testResult.submittedAt
      }
    };
  }

  async createTestExam(testId: string, userId: string): Promise<TestResult> {
    console.log('=== DEBUG: startTest called ===');
    console.log('testId:', testId);
    console.log('userId:', userId);

    const test = await this.testRepository.findOne({ where: { id: testId } });
    if (!test) {
      throw new NotFoundException(`Test with ID ${testId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const now = new Date(); 
    const testDuration = test.duration; 
    const testEndedAt = new Date(now.getTime() + testDuration * 60 * 1000); // Convert minutes to milliseconds

    console.log('testEndedAt:', testEndedAt);
    const questions = await this.assignRandomQuestions(test.subject, test.numOfQuestion);
    const questionIds = questions.map(q => q.id);
    console.log('questionIds:', questionIds);
    // Create a new test result with submittedAt: null
    const testResult = this.testResultRepository.create({
      test,
      user,
      answers: {},
      score: 0,
      totalScore: 0,
      percentageScore: 0,
      questionResults: [],
      submittedAt: null,
      createdAt: now,
      endedAt: testEndedAt,
      duration: 0,
      questionIds: questionIds,
    });

    return await this.testResultRepository.save(testResult);
  }

  // Utility function to shuffle an array (matches client-side logic)
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Function to shuffle question choices (matches client-side logic exactly)
  private shuffleQuestionChoices(question: any): any {
    const shuffledQuestion = { ...question };

    // Shuffle choices for MCQ, True/False, Yes/No questions
    if (question.choices && question.choices.length > 0) {
      shuffledQuestion.choices = this.shuffleArray(question.choices);
    }

    // Shuffle matching pairs (shuffle the answer side while keeping question side fixed)
    if (question.matchingPairs && question.matchingPairs.length > 0) {
      const questions = question.matchingPairs.map(pair => pair.question);
      const answers = this.shuffleArray(question.matchingPairs.map(pair => pair.answer));
      
      shuffledQuestion.matchingPairs = questions.map((question, index) => ({
        question,
        answer: answers[index]
      }));
    }

    // For fill-in-blank, just shuffle the blanks array order
    if (question.blanks && question.blanks.length > 0) {
      shuffledQuestion.blanks = this.shuffleArray([...question.blanks]);
    }

    return shuffledQuestion;
  }

  // Get test questions with shuffled answers
  async getTestQuestions(testResultId: string, userId: string) {
    console.log('=== DEBUG: getTestQuestions called ===');
    console.log('testResultId:', testResultId);
    console.log('userId:', userId);

    const testResult = await this.testResultRepository.findOne({
      where: { id: testResultId, user: { id: userId } },
      relations: ['test', 'user']
    });

    if (!testResult) {
      throw new NotFoundException(`Test result with ID ${testResultId} not found`);
    }

    if (!testResult.questionIds || testResult.questionIds.length === 0) {
      throw new BadRequestException('No questions assigned to this test');
    }

    console.log('questionIds:', testResult.questionIds);

    // Get questions
    const questions = await this.questionRepository.findBy({ 
      id: In(testResult.questionIds),
      isActive: true 
    });

    console.log('Found questions:', questions.length);

    // Shuffle answer choices for each question
    const shuffledQuestions = questions.map(question => {
      console.log(`Shuffling question ${question.id}:`);
      console.log('Original choices:', question.choices);
      
      const shuffledQuestion = this.shuffleQuestionChoices(question);
      
      console.log('Shuffled choices:', shuffledQuestion.choices);
      console.log('Choices changed:', JSON.stringify(question.choices) !== JSON.stringify(shuffledQuestion.choices));
      
      return shuffledQuestion;
    });

    console.log('Returning shuffled questions:', shuffledQuestions.length);
    return shuffledQuestions;
  }

  async submitAnswers(
    testResultId: string,
    userId: string,
    payload: { answers: Record<string, any> },
  ): Promise<TestResult> {
    console.log('=== DEBUG: submitAnswers called ===');
    console.log('testResultId:', testResultId);
    console.log('payload:', JSON.stringify(payload, null, 2));

    const testResult = await this.testResultRepository.findOne({ where: { id: testResultId, user: { id: userId } }, relations: ['test', 'user'] , });
    if (!testResult) {
      throw new NotFoundException(`Test result with ID ${testResultId} not found`);
    }

    console.log('testResult:', testResult); 
    // Find the existing test result for this user and test that hasn't been submitted yet
    // const existingTestResult = await this.testResultRepository.findOne({
    //   where: {
    //     test: { id: testResult.test.id },
    //     user: { id: userId },
    //     submittedAt: IsNull(),
    //   },
    // });
    // if (!existingTestResult) {
    //   throw new NotFoundException('No started test found for this user and test.');
    // }

    // console.log('existingTestResult:', existingTestResult);
    // Get questions using the stored question IDs from the test result
    const questions = await this.questionRepository.findBy({ 
      id: In(testResult.questionIds),
      isActive: true 
    });
    if (questions.length !== testResult.questionIds.length) {
      const foundIds = questions.map(q => q.id);
      const missingIds = testResult.questionIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Questions not found: ${missingIds.join(', ')}`);
    }

    console.log('questions found:', questions.length);
    console.log('questionIds from test result:', testResult.questionIds);
    console.log('questions data:', questions.map(q => ({ id: q.id, type: q.type, score: q.score })));

    let calculatedScore = 0;
    let totalPossibleScore = 0;
    const questionResults: QuestionResult[] = [];

    // Merge new answers with existing saved answers to preserve progress
    const mergedAnswers = { ...testResult.answers, ...payload.answers };
    
    console.log('=== ANSWER MERGING DEBUG ===');
    console.log('Existing saved answers:', testResult.answers);
    console.log('New payload answers:', payload.answers);
    console.log('Merged answers:', mergedAnswers);
    
    for (const question of questions) {
      totalPossibleScore += question.score;
      const userAnswer = mergedAnswers[question.id.toString()];
      
      console.log(`Processing question ${question.id}:`, {
        questionType: question.type,
        questionScore: question.score,
        userAnswer: userAnswer,
        answerKey: question.id.toString(),
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        choices: question.choices,
        matchingPairs: question.matchingPairs,
        blanks: question.blanks
      });
      
      const hasAnswer = userAnswer && (
        (userAnswer.text !== undefined && userAnswer.text !== null && userAnswer.text !== '') ||
        (Array.isArray(userAnswer) && userAnswer.length > 0) ||
        Object.keys(userAnswer).some(key => key !== 'text' && userAnswer[key] !== undefined && userAnswer[key] !== null && userAnswer[key] !== '')
      );
      
      console.log(`Answer detection for question ${question.id}:`, {
        userAnswer: userAnswer,
        userAnswerType: typeof userAnswer,
        isArray: Array.isArray(userAnswer),
        hasTextAnswer: userAnswer?.text !== undefined && userAnswer?.text !== null && userAnswer?.text !== '',
        hasIndexedAnswers: Object.keys(userAnswer || {}).some(key => key !== 'text' && userAnswer[key] !== undefined && userAnswer[key] !== null && userAnswer[key] !== ''),
        hasAnswer: hasAnswer,
        answerKeys: userAnswer ? Object.keys(userAnswer) : []
      });
      
      if (!hasAnswer) {
        console.log(`No answer for question ${question.id}`);
        questionResults.push({
          questionId: question.id,
          isCorrect: false,
          score: 0,
          reason: 'No answer provided'
        });
        continue;
      }

      let isCorrect = false;
      let reason = '';

      switch (question.type) {
        case QuestionType.MCQ:
          console.log(`=== MCQ Question Processing ===`);
          const correctChoices = question.choices?.filter((c) => c.isCorrect) || [];
          const userSelectedChoices = Array.isArray(userAnswer.text) 
            ? userAnswer.text 
            : [userAnswer.text].filter(Boolean);
          
          console.log(`MCQ Debug for question ${question.id}:`, {
            correctChoices: correctChoices.map(c => ({ text: c.text, isCorrect: c.isCorrect })),
            userSelectedChoices: userSelectedChoices,
            originalUserAnswer: userAnswer.text,
            isArray: Array.isArray(userAnswer.text),
            correctChoiceTexts: correctChoices.map(c => c.text),
            userChoiceTexts: userSelectedChoices
          });
          
          const allCorrectSelected = correctChoices.every((choice: any) => 
            userSelectedChoices.includes(choice.text || "")
          );
          const noIncorrectSelected = userSelectedChoices.every((choice: string) => 
            correctChoices.some((correct: any) => correct.text === choice)
          );
          
          console.log(`MCQ Comparison for question ${question.id}:`, {
            allCorrectSelected,
            noIncorrectSelected,
            userSelectedLength: userSelectedChoices.length,
            correctChoicesLength: correctChoices.length,
            userSelectedChoices,
            isCorrect,
            correctChoiceTexts: correctChoices.map(c => c.text)
          });
          
          isCorrect = allCorrectSelected && 
                     noIncorrectSelected && 
                     userSelectedChoices.length === correctChoices.length;
          
          reason = isCorrect 
            ? 'All correct choices selected' 
            : `Expected: ${correctChoices.map(c => c.text).join(', ')}, Got: ${userSelectedChoices.join(', ')}`;
          break;

        case QuestionType.TRUE_FALSE:
          console.log(`=== TRUE/FALSE Question Processing ===`);
          console.log(`True/False Debug for question ${question.id}:`, {
            questionType: question.type,
            questionText: question.questionText,
            correctAnswer: question.correctAnswer,
            userAnswer: userAnswer.text,
            choices: question.choices
          });
          
          const normalizeAnswer = (answer: string) => {
            const normalized = answer.toLowerCase().trim();
            if (normalized === 'true' || normalized === 'yes') return 'Yes';
            if (normalized === 'false' || normalized === 'no') return 'No';
            return answer;
          };
          
          const normalizedUserAnswer = normalizeAnswer(userAnswer.text);
          const normalizedCorrectAnswer = normalizeAnswer(question.correctAnswer);
          
          isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
          reason = isCorrect 
            ? 'Correct answer' 
            : `Expected: ${question.correctAnswer}, Got: ${userAnswer.text}`;
          break;

        case QuestionType.YES_NO:
          console.log(`=== YES/NO Question Processing ===`);
          console.log(`Yes/No Debug for question ${question.id}:`, {
            questionType: question.type,
            questionText: question.questionText,
            correctAnswer: question.correctAnswer,
            userAnswer: userAnswer.text,
            choices: question.choices
          });
          
          const normalizeYesNoAnswer = (answer: string) => {
            const normalized = answer.toLowerCase().trim();
            if (normalized === 'true' || normalized === 'yes') return 'Yes';
            if (normalized === 'false' || normalized === 'no') return 'No';
            return answer;
          };
          
          const normalizedYesNoUserAnswer = normalizeYesNoAnswer(userAnswer.text);
          const normalizedYesNoCorrectAnswer = normalizeYesNoAnswer(question.correctAnswer);
          
          console.log(`Yes/No Comparison for question ${question.id}:`, {
            originalUserAnswer: userAnswer.text,
            originalCorrectAnswer: question.correctAnswer,
            normalizedUserAnswer: normalizedYesNoUserAnswer,
            normalizedCorrectAnswer: normalizedYesNoCorrectAnswer,
            isCorrect: normalizedYesNoUserAnswer === normalizedYesNoCorrectAnswer
          });
          
          isCorrect = normalizedYesNoUserAnswer === normalizedYesNoCorrectAnswer;
          reason = isCorrect 
            ? 'Correct answer' 
            : `Expected: ${question.correctAnswer}, Got: ${userAnswer.text}`;
          break;

        case QuestionType.MATCHING:
          console.log(`=== MATCHING Question Processing ===`);
          console.log(`Matching Debug for question ${question.id}:`, {
            matchingPairs: question.matchingPairs,
            userAnswer: userAnswer,
            userAnswerType: typeof userAnswer,
            isArray: Array.isArray(userAnswer),
            userAnswersArray: Object.keys(userAnswer).map(key => ({ index: key, answer: userAnswer[key] }))
          });
          
          if (Array.isArray(userAnswer) && userAnswer.length === 0) {
            console.log(`Matching question ${question.id} received empty array - no answers provided`);
            reason = 'No matching answers provided';
            isCorrect = false;
          } else if (Array.isArray(userAnswer)) {
            isCorrect = question.matchingPairs?.every(
              (pair, idx) => userAnswer[idx] === pair.answer,
            ) || false;
            reason = isCorrect 
              ? 'All matching pairs correct' 
              : 'Some matching pairs incorrect';
          } else {
            isCorrect = question.matchingPairs?.every(
              (pair, idx) => userAnswer[idx.toString()] === pair.answer,
            ) || false;
            reason = isCorrect 
              ? 'All matching pairs correct' 
              : 'Some matching pairs incorrect';
          }
          break;

        case QuestionType.FILL_BLANK:
          console.log(`=== FILL BLANK Question Processing ===`);
          console.log(`Fill Blank Debug for question ${question.id}:`, {
            blanks: question.blanks,
            userAnswer: userAnswer,
            userAnswerType: typeof userAnswer,
            isArray: Array.isArray(userAnswer),
            userAnswersArray: Object.keys(userAnswer).map(key => ({ index: key, answer: userAnswer[key] }))
          });
          
          if (Array.isArray(userAnswer) && userAnswer.length === 0) {
            console.log(`Fill blank question ${question.id} received empty array - no answers provided`);
            reason = 'No blank answers provided';
            isCorrect = false;
          } else if (Array.isArray(userAnswer)) {
            isCorrect = question.blanks?.every(
              (blank, idx) => userAnswer[idx] === blank.answer,
            ) || false;
            reason = isCorrect 
              ? 'All blanks filled correctly' 
              : 'Some blanks incorrect';
          } else {
            isCorrect = question.blanks?.every(
              (blank, idx) => userAnswer[idx.toString()] === blank.answer,
            ) || false;
            reason = isCorrect 
              ? 'All blanks filled correctly' 
              : 'Some blanks incorrect';
            
          }
          break;

        default:
          console.log(`=== UNKNOWN Question Type: ${question.type} ===`);
          reason = `Unknown question type: ${question.type}`;
          break;
      }

      if (isCorrect) {
        calculatedScore += question.score;
      }
      else {
        calculatedScore -= question.score * 0.5;
      }
      

      questionResults.push({
        questionId: question.id,
        isCorrect,
        score: isCorrect ? question.score : - (question.score * 0.5),
        reason
      });
    }

    const percentageScore = totalPossibleScore > 0 
      ? parseFloat(((calculatedScore / totalPossibleScore) * 100).toFixed(2))
      : 0;

    console.log('=== FINAL RESULTS ===');
    console.log('calculatedScore:', calculatedScore);
    console.log('totalPossibleScore:', totalPossibleScore);
    console.log('percentageScore:', percentageScore);
    console.log('questionResults:', questionResults);

    // Update the existing test result
    testResult.answers = mergedAnswers;
    testResult.score = calculatedScore;
    testResult.totalScore = totalPossibleScore;
    testResult.percentageScore = percentageScore;
    testResult.questionResults = questionResults;
    testResult.submittedAt = new Date();
    
    // Calculate duration in seconds
    const durationMs = testResult.submittedAt.getTime() - testResult.createdAt.getTime();
    const calculatedDuration = Math.floor(durationMs / 1000);
    
    // Cap duration at test's maximum duration (convert minutes to seconds)
    const maxTestDuration = testResult.test.duration * 60;
    testResult.duration = Math.min(calculatedDuration, maxTestDuration);

    return this.testResultRepository.save(testResult);
  }


  async assignRandomQuestions(subject: string, numOfQuestions: number) {
    const allQuestions = await this.questionRepository.find({
      where: { 
        subject: subject as any,
        isActive: true 
      }
    });

    if (allQuestions.length === 0) {
      throw new BadRequestException(`No questions found for subject: ${subject}`);
    }

    if (allQuestions.length < numOfQuestions) {
      throw new BadRequestException(
        `Not enough questions for subject ${subject}. Available: ${allQuestions.length}, Requested: ${numOfQuestions}`
      );
    }

    const shuffledQuestions = this.shuffleArray([...allQuestions]);
    const selectedQuestions = shuffledQuestions.slice(0, numOfQuestions);
    
    // Apply answer shuffling to each selected question
    return selectedQuestions.map(question => this.shuffleQuestionChoices(question));
  }

  async getUnsubmittedTestResult(testId: string, userId: string) {
    const testResult = await this.testResultRepository.findOne({ where: { test: { id: testId }, user: { id: userId }, submittedAt: IsNull() }, relations: ['test', 'user'] });
    if (!testResult) {
      throw new NotFoundException(`Test result with ID ${testId} not found`);
    }
    return true;
  }

  async saveAnswers(
    testResultId: string,
    userId: string,
    payload: { answers: Record<string, any> },
  ): Promise<TestResult> {
    console.log('=== DEBUG: saveAnswers called ===');
    console.log('testResultId:', testResultId);
    console.log('payload:', JSON.stringify(payload, null, 2));

    const testResult = await this.testResultRepository.findOne({ 
      where: { id: testResultId, user: { id: userId } }, 
      relations: ['test', 'user'] 
    });
    
    if (!testResult) {
      throw new NotFoundException(`Test result with ID ${testResultId} not found`);
    }

    // Check if the test has already been submitted
    if (testResult.submittedAt) {
      throw new BadRequestException('Cannot save answers for a test that has already been submitted');
    }

    console.log('testResult found:', testResult);

    // Update only the answers field without calculating scores or marking as submitted
    testResult.answers = payload.answers;

    return this.testResultRepository.save(testResult);
  }

  async getLeaderboard(
    testId?: string,
    sortBy: 'percentageScore' | 'score' | 'duration' = 'percentageScore',
    limit: number = 10
  ): Promise<any[]> {
    console.log('=== DEBUG: getLeaderboard called ===');
    console.log('testId:', testId);
    console.log('sortBy:', sortBy);
    console.log('limit:', limit);

    // Build the query
    let query = this.testResultRepository
      .createQueryBuilder('testResult')
      .leftJoinAndSelect('testResult.user', 'user')
      .leftJoinAndSelect('testResult.test', 'test')
      .where('testResult.submittedAt IS NOT NULL'); // Only submitted tests

    // Filter by specific test if provided
    if (testId) {
      query = query.andWhere('testResult.test.id = :testId', { testId });
    }

    // Add sorting based on the sortBy parameter
    switch (sortBy) {
      case 'percentageScore':
        query = query.orderBy('testResult.percentageScore', 'DESC');
        break;
      case 'score':
        query = query.orderBy('testResult.score', 'DESC');
        break;
      case 'duration':
        query = query.orderBy('testResult.duration', 'ASC'); // ASC for fastest first
        break;
      default:
        query = query.orderBy('testResult.percentageScore', 'DESC');
    }

    // Add secondary sorting for ties
    switch (sortBy) {
      case 'percentageScore':
        query = query.addOrderBy('testResult.duration', 'ASC'); // Fastest duration as tiebreaker
        break;
      case 'score':
        query = query.addOrderBy('testResult.percentageScore', 'DESC'); // Higher percentage as tiebreaker
        break;
      case 'duration':
        query = query.addOrderBy('testResult.percentageScore', 'DESC'); // Higher percentage as tiebreaker
        break;
    }

    // Add tertiary sorting for further ties
    query = query.addOrderBy('testResult.submittedAt', 'ASC'); // Earliest submission as final tiebreaker

    // Limit results
    query = query.limit(limit);

    const results = await query.getMany();

    console.log(`Found ${results.length} leaderboard entries`);

    // Transform results to include rank and user info
    const leaderboard = results.map((result, index) => ({
      rank: index + 1,
      userId: result.user.id,
      username: result.user.name,
      email: result.user.email,
      testId: result.test.id,
      testSubject: result.test.subject,
      score: result.score,
      totalScore: result.totalScore,
      percentageScore: result.percentageScore,
      duration: result.duration,
      durationFormatted: this.formatDuration(result.duration),
      submittedAt: result.submittedAt,
      questionResults: result.questionResults,
      numOfQuestion: result.test.numOfQuestion,
      testDuration: result.test.duration
    }));

    return leaderboard;
  }
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  async getLeaderboardBySubject(limit: number = 10): Promise<any[]> {
    console.log('=== DEBUG: getLeaderboardBySubject called ===');
    
    // Get all unique subjects from submitted tests
    const subjectsQuery = await this.testResultRepository
      .createQueryBuilder('testResult')
      .leftJoinAndSelect('testResult.test', 'test')
      .select('DISTINCT test.subject', 'subject')
      .where('testResult.submittedAt IS NOT NULL')
      .getRawMany();

    const subjects = subjectsQuery.map(row => row.subject);
    console.log('Found subjects:', subjects);

    const leaderboardBySubject: any[] = [];

    for (const subject of subjects) {
      const subjectLeaderboard = await this.testResultRepository
        .createQueryBuilder('testResult')
        .leftJoinAndSelect('testResult.user', 'user')
        .leftJoinAndSelect('testResult.test', 'test')
        .where('testResult.submittedAt IS NOT NULL')
        .andWhere('test.subject = :subject', { subject })
        .orderBy('testResult.percentageScore', 'DESC')
        .addOrderBy('testResult.duration', 'ASC')
        .addOrderBy('testResult.submittedAt', 'ASC')
        .limit(limit)
        .getMany();

      const formattedLeaderboard = subjectLeaderboard.map((result, index) => ({
        rank: index + 1,
        userId: result.user.id,
        username: result.user.name,
        email: result.user.email,
        testId: result.test.id,
        testSubject: result.test.subject,
        score: result.score,
        totalScore: result.totalScore,
        percentageScore: result.percentageScore,
        duration: result.duration,
        durationFormatted: this.formatDuration(result.duration),
        submittedAt: result.submittedAt,
      }));

      leaderboardBySubject.push({
        subject,
        leaderboard: formattedLeaderboard
      });
    }

    return leaderboardBySubject;
  }

  async getActiveUserCount(days: number = 30): Promise<number> {
    console.log('=== DEBUG: getActiveUserCount called ===');
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const activeUsers = await this.testResultRepository
      .createQueryBuilder('testResult')
      .select('DISTINCT testResult.user.id', 'userId')
      .where('testResult.submittedAt IS NOT NULL')
      .andWhere('testResult.submittedAt >= :dateThreshold', { dateThreshold })
      .getRawMany();

    console.log(`Found ${activeUsers.length} active users in last ${days} days`);
    return activeUsers.length;
  }

  async getStudentImprovementStats(): Promise<any> {
    console.log('=== DEBUG: getStudentImprovementStats called ===');

    // Get first and latest test scores for each user per subject
    const userImprovements = await this.testResultRepository
      .createQueryBuilder('testResult')
      .leftJoinAndSelect('testResult.user', 'user')
      .leftJoinAndSelect('testResult.test', 'test')
      .where('testResult.submittedAt IS NOT NULL')
      .orderBy('user.id')
      .addOrderBy('test.subject')
      .addOrderBy('testResult.submittedAt')
      .getMany();

    // Group by user and subject to find first and last attempts
    const userSubjectMap = new Map();
    
    userImprovements.forEach(result => {
      const key = `${result.user.id}-${result.test.subject}`;
      
      if (!userSubjectMap.has(key)) {
        userSubjectMap.set(key, {
          userId: result.user.id,
          userName: result.user.name,
          subject: result.test.subject,
          firstAttempt: result,
          lastAttempt: result,
          attemptCount: 1
        });
      } else {
        const existing = userSubjectMap.get(key);
        existing.lastAttempt = result;
        existing.attemptCount++;
        userSubjectMap.set(key, existing);
      }
    });

    // Calculate improvements for users with multiple attempts
    const improvements: any[] = [];
    let usersWithImprovement = 0;
    let totalImprovement = 0;

    for (const [key, data] of userSubjectMap) {
      if (data.attemptCount > 1) {
        const improvement = data.lastAttempt.percentageScore - data.firstAttempt.percentageScore;
        improvements.push({
          userId: data.userId,
          userName: data.userName,
          subject: data.subject,
          firstScore: data.firstAttempt.percentageScore,
          lastScore: data.lastAttempt.percentageScore,
          improvement: improvement,
          attemptCount: data.attemptCount
        });
        
        if (improvement > 0) {
          usersWithImprovement++;
        }
        totalImprovement += improvement;
      }
    }

    const averageImprovement = improvements.length > 0 
      ? parseFloat((totalImprovement / improvements.length).toFixed(2))
      : 0;

    const improvementPercentage = improvements.length > 0 
      ? parseFloat(((usersWithImprovement / improvements.length) * 100).toFixed(2))
      : 0;

    console.log(`Improvement stats: ${improvements.length} users with multiple attempts, ${averageImprovement}% average improvement`);

    return {
      averageImprovement,
      usersWithImprovement,
      improvementPercentage,
      totalUsersAnalyzed: improvements.length
    };
  }

  async getTotalUsers(): Promise<number> {
    const totalUsers = await this.userRepository.count();
    console.log(`Total users: ${totalUsers}`);
    return totalUsers;
  }

  async getTotalTestsTakenBySubject(): Promise<any> {
    const totalTests = await this.testResultRepository.count({
      where: { submittedAt: Not(IsNull()) }
    });
    console.log(`Total tests taken: ${totalTests}`);
    return totalTests;
  }

  async getTotalTestsTaken(): Promise<number> {
    const totalTests = await this.testResultRepository.count({
      where: { submittedAt: Not(IsNull()) }
    });
    console.log(`Total tests taken: ${totalTests}`);
    return totalTests;
  }

  async getLandingPageData(): Promise<any> {
    console.log('=== DEBUG: getLandingPageData called ===');

    const [
      leaderboardBySubject,
      activeUserCount,
      studentImprovement,
      totalUsers,
      totalTestsTaken
    ] = await Promise.all([
      this.getLeaderboardBySubject(10),
      this.getActiveUserCount(30),
      this.getStudentImprovementStats(),
      this.getTotalUsers(),
      this.getTotalTestsTaken()
    ]);

    return {
      leaderboardBySubject,
      activeUserCount,
      studentImprovement,
      totalUsers,
      totalTestsTaken
    };
  }
}
