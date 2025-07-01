// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, In } from 'typeorm';
// import { TestResult } from './entities/test-result.entity';
// import { Test } from '../tests/entities/test.entity';
// import { User } from '../users/entities/user.entity';    
// import { Question } from '../questions/entities/question.entity';
// import { QuestionType } from 'src/types/questions';
// import { QuestionResult } from 'src/types/question-result';

// @Injectable()
// export class TestResultsService {
//   constructor(
//     @InjectRepository(TestResult)
//     private testResultRepository: Repository<TestResult>,
//     @InjectRepository(Test)
//     private testRepository: Repository<Test>,
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//     @InjectRepository(Question)
//     private questionRepository: Repository<Question>,
//   ) {}

//   async submitAnswers(
//     testId: string,
//     userId: string,
//     payload: { answers: Record<string, any>, questionIds: string[] },
//   ): Promise<TestResult> {
//     console.log('=== DEBUG: submitAnswers called ===');
//     console.log('testId:', testId);
//     console.log('userId:', userId);
//     console.log('payload:', JSON.stringify(payload, null, 2));

//     const test = await this.testRepository.findOne({ where: { id: testId } });
//     if (!test) {
//       throw new NotFoundException(`Test with ID ${testId} not found`);
//     }

//     const user = await this.userRepository.findOne({ where: { id: userId } });
//     if (!user) {
//       throw new NotFoundException(`User with ID ${userId} not found`);
//     }

//     // Fetch questions based on provided questionIds
//     const questions = await this.questionRepository.findBy({ id: In(payload.questionIds) });
//     if (questions.length !== payload.questionIds.length) {
//       const foundIds = questions.map(q => q.id);
//       const missingIds = payload.questionIds.filter(id => !foundIds.includes(id));
//       throw new NotFoundException(`Questions not found: ${missingIds.join(', ')}`);
//     }

//     console.log('questions found:', questions.length);
//     console.log('questionIds:', payload.questionIds);
//     console.log('questions data:', questions.map(q => ({ id: q.id, type: q.type, score: q.score })));

//     // Calculate score
//     let calculatedScore = 0;
//     let totalPossibleScore = 0;
//     const questionResults: QuestionResult[] = [];

//     for (const question of questions) {
//       totalPossibleScore += question.score;
//       const userAnswer = payload.answers[question.id.toString()];
      
//       console.log(`Processing question ${question.id}:`, {
//         questionType: question.type,
//         questionScore: question.score,
//         userAnswer: userAnswer,
//         answerKey: question.id.toString(),
//         questionText: question.questionText,
//         correctAnswer: question.correctAnswer,
//         choices: question.choices,
//         matchingPairs: question.matchingPairs,
//         blanks: question.blanks
//       });
      
//       // Check if user provided any answer
//       const hasAnswer = userAnswer && (
//         (userAnswer.text !== undefined && userAnswer.text !== null && userAnswer.text !== '') ||
//         (Array.isArray(userAnswer) && userAnswer.length > 0) ||
//         Object.keys(userAnswer).some(key => key !== 'text' && userAnswer[key] !== undefined && userAnswer[key] !== null && userAnswer[key] !== '')
//       );
      
//       console.log(`Answer detection for question ${question.id}:`, {
//         userAnswer: userAnswer,
//         userAnswerType: typeof userAnswer,
//         isArray: Array.isArray(userAnswer),
//         hasTextAnswer: userAnswer?.text !== undefined && userAnswer?.text !== null && userAnswer?.text !== '',
//         hasIndexedAnswers: Object.keys(userAnswer || {}).some(key => key !== 'text' && userAnswer[key] !== undefined && userAnswer[key] !== null && userAnswer[key] !== ''),
//         hasAnswer: hasAnswer,
//         answerKeys: userAnswer ? Object.keys(userAnswer) : []
//       });
      
//       if (!hasAnswer) {
//         console.log(`No answer for question ${question.id}`);
//         questionResults.push({
//           questionId: question.id,
//           isCorrect: false,
//           score: 0,
//           reason: 'No answer provided'
//         });
//         continue;
//       }

//       let isCorrect = false;
//       let reason = '';

//       switch (question.type) {
//         case QuestionType.MCQ:
//           console.log(`=== MCQ Question Processing ===`);
//           const correctChoices = question.choices?.filter((c) => c.isCorrect) || [];
//           const userSelectedChoices = Array.isArray(userAnswer.text) 
//             ? userAnswer.text 
//             : [userAnswer.text].filter(Boolean);
          
//           console.log(`MCQ Debug for question ${question.id}:`, {
//             correctChoices: correctChoices.map(c => ({ text: c.text, isCorrect: c.isCorrect })),
//             userSelectedChoices: userSelectedChoices,
//             originalUserAnswer: userAnswer.text,
//             isArray: Array.isArray(userAnswer.text),
//             correctChoiceTexts: correctChoices.map(c => c.text),
//             userChoiceTexts: userSelectedChoices
//           });
          
//           const allCorrectSelected = correctChoices.every((choice: any) => 
//             userSelectedChoices.includes(choice.text || "")
//           );
//           const noIncorrectSelected = userSelectedChoices.every((choice: string) => 
//             correctChoices.some((correct: any) => correct.text === choice)
//           );
          
//           console.log(`MCQ Comparison for question ${question.id}:`, {
//             allCorrectSelected,
//             noIncorrectSelected,
//             userSelectedLength: userSelectedChoices.length,
//             correctChoicesLength: correctChoices.length,
//             userSelectedChoices,
//             correctChoiceTexts: correctChoices.map(c => c.text)
//           });
          
//           isCorrect = allCorrectSelected && 
//                      noIncorrectSelected && 
//                      userSelectedChoices.length === correctChoices.length;
          
//           reason = isCorrect 
//             ? 'All correct choices selected' 
//             : `Expected: ${correctChoices.map(c => c.text).join(', ')}, Got: ${userSelectedChoices.join(', ')}`;
//           break;

//         case QuestionType.TRUE_FALSE:
//           console.log(`=== TRUE/FALSE Question Processing ===`);
//           console.log(`True/False Debug for question ${question.id}:`, {
//             questionType: question.type,
//             questionText: question.questionText,
//             correctAnswer: question.correctAnswer,
//             userAnswer: userAnswer.text,
//             choices: question.choices
//           });
          
//           const normalizeAnswer = (answer: string) => {
//             const normalized = answer.toLowerCase().trim();
//             if (normalized === 'true' || normalized === 'yes') return 'Yes';
//             if (normalized === 'false' || normalized === 'no') return 'No';
//             return answer;
//           };
          
//           const normalizedUserAnswer = normalizeAnswer(userAnswer.text);
//           const normalizedCorrectAnswer = normalizeAnswer(question.correctAnswer);
          
//           isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
//           reason = isCorrect 
//             ? 'Correct answer' 
//             : `Expected: ${question.correctAnswer}, Got: ${userAnswer.text}`;
//           break;

//         case QuestionType.YES_NO:
//           console.log(`=== YES/NO Question Processing ===`);
//           console.log(`Yes/No Debug for question ${question.id}:`, {
//             questionType: question.type,
//             questionText: question.questionText,
//             correctAnswer: question.correctAnswer,
//             userAnswer: userAnswer.text,
//             choices: question.choices
//           });
          
//           const normalizeYesNoAnswer = (answer: string) => {
//             const normalized = answer.toLowerCase().trim();
//             if (normalized === 'true' || normalized === 'yes') return 'Yes';
//             if (normalized === 'false' || normalized === 'no') return 'No';
//             return answer;
//           };
          
//           const normalizedYesNoUserAnswer = normalizeYesNoAnswer(userAnswer.text);
//           const normalizedYesNoCorrectAnswer = normalizeYesNoAnswer(question.correctAnswer);
          
//           console.log(`Yes/No Comparison for question ${question.id}:`, {
//             originalUserAnswer: userAnswer.text,
//             originalCorrectAnswer: question.correctAnswer,
//             normalizedUserAnswer: normalizedYesNoUserAnswer,
//             normalizedCorrectAnswer: normalizedYesNoCorrectAnswer,
//             isCorrect: normalizedYesNoUserAnswer === normalizedYesNoCorrectAnswer
//           });
          
//           isCorrect = normalizedYesNoUserAnswer === normalizedYesNoCorrectAnswer;
//           reason = isCorrect 
//             ? 'Correct answer' 
//             : `Expected: ${question.correctAnswer}, Got: ${userAnswer.text}`;
//           break;

//         case QuestionType.MATCHING:
//           console.log(`=== MATCHING Question Processing ===`);
//           console.log(`Matching Debug for question ${question.id}:`, {
//             matchingPairs: question.matchingPairs,
//             userAnswer: userAnswer,
//             userAnswerType: typeof userAnswer,
//             isArray: Array.isArray(userAnswer),
//             userAnswersArray: Object.keys(userAnswer).map(key => ({ index: key, answer: userAnswer[key] }))
//           });
          
//           if (Array.isArray(userAnswer) && userAnswer.length === 0) {
//             console.log(`Matching question ${question.id} received empty array - no answers provided`);
//             reason = 'No matching answers provided';
//             isCorrect = false;
//           } else if (Array.isArray(userAnswer)) {
//             isCorrect = question.matchingPairs?.every(
//               (pair, idx) => userAnswer[idx] === pair.answer,
//             ) || false;
//             reason = isCorrect 
//               ? 'All matching pairs correct' 
//               : 'Some matching pairs incorrect';
//           } else {
//             isCorrect = question.matchingPairs?.every(
//               (pair, idx) => userAnswer[idx.toString()] === pair.answer,
//             ) || false;
//             reason = isCorrect 
//               ? 'All matching pairs correct' 
//               : 'Some matching pairs incorrect';
//           }
//           break;

//         case QuestionType.FILL_BLANK:
//           console.log(`=== FILL BLANK Question Processing ===`);
//           console.log(`Fill Blank Debug for question ${question.id}:`, {
//             blanks: question.blanks,
//             userAnswer: userAnswer,
//             userAnswerType: typeof userAnswer,
//             isArray: Array.isArray(userAnswer),
//             userAnswersArray: Object.keys(userAnswer).map(key => ({ index: key, answer: userAnswer[key] }))
//           });
          
//           if (Array.isArray(userAnswer) && userAnswer.length === 0) {
//             console.log(`Fill blank question ${question.id} received empty array - no answers provided`);
//             reason = 'No blank answers provided';
//             isCorrect = false;
//           } else if (Array.isArray(userAnswer)) {
//             isCorrect = question.blanks?.every(
//               (blank, idx) => userAnswer[idx] === blank.answer,
//             ) || false;
//             reason = isCorrect 
//               ? 'All blanks filled correctly' 
//               : 'Some blanks incorrect';
//           } else {
//             isCorrect = question.blanks?.every(
//               (blank, idx) => userAnswer[idx.toString()] === blank.answer,
//             ) || false;
//             reason = isCorrect 
//               ? 'All blanks filled correctly' 
//               : 'Some blanks incorrect';
//           }
//           break;

//         default:
//           console.log(`=== UNKNOWN Question Type: ${question.type} ===`);
//           reason = `Unknown question type: ${question.type}`;
//           break;
//       }

//       if (isCorrect) {
//         calculatedScore += question.score;
//       }

//       questionResults.push({
//         questionId: question.id,
//         isCorrect,
//         score: isCorrect ? question.score : 0,
//         reason
//       });
//     }

//     const percentageScore = totalPossibleScore > 0 
//       ? (calculatedScore / totalPossibleScore) * 100 
//       : 0;

//     console.log('=== FINAL RESULTS ===');
//     console.log('calculatedScore:', calculatedScore);
//     console.log('totalPossibleScore:', totalPossibleScore);
//     console.log('percentageScore:', percentageScore);
//     console.log('questionResults:', questionResults);

//     const testResult = this.testResultRepository.create({
//       test,
//       user,
//       answers: payload.answers,
//       score: calculatedScore,
//       totalScore: totalPossibleScore,
//       percentageScore: percentageScore,
//       questionResults,
//       submittedAt: new Date(),
//     });

//     return this.testResultRepository.save(testResult);
//   }
// }




import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

  async findByUser(userId: string): Promise<TestResult[]> {
    console.log('=== DEBUG: findByUser called ===');
    console.log('userId:', userId);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const testResults = await this.testResultRepository.find({
      where: { user: { id: userId } },
      relations: ['test'],
      order: { submittedAt: 'DESC' },
    });

    console.log('testResults found:', testResults.length);

    // Fetch question details for each test result
    for (const result of testResults) {
      const questionIds = result.questionResults.map(qr => qr.questionId);
      const questions = await this.questionRepository.findBy({ id: In(questionIds) });
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

  async submitAnswers(
    testId: string,
    userId: string,
    payload: { answers: Record<string, any>, questionIds: string[] },
  ): Promise<TestResult> {
    console.log('=== DEBUG: submitAnswers called ===');
    console.log('testId:', testId);
    console.log('userId:', userId);
    console.log('payload:', JSON.stringify(payload, null, 2));

    const test = await this.testRepository.findOne({ where: { id: testId } });
    if (!test) {
      throw new NotFoundException(`Test with ID ${testId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const questions = await this.questionRepository.findBy({ id: In(payload.questionIds) });
    if (questions.length !== payload.questionIds.length) {
      const foundIds = questions.map(q => q.id);
      const missingIds = payload.questionIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Questions not found: ${missingIds.join(', ')}`);
    }

    console.log('questions found:', questions.length);
    console.log('questionIds:', payload.questionIds);
    console.log('questions data:', questions.map(q => ({ id: q.id, type: q.type, score: q.score })));

    let calculatedScore = 0;
    let totalPossibleScore = 0;
    const questionResults: QuestionResult[] = [];

    for (const question of questions) {
      totalPossibleScore += question.score;
      const userAnswer = payload.answers[question.id.toString()];
      
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
      ? (calculatedScore / totalPossibleScore) * 100 
      : 0;

    console.log('=== FINAL RESULTS ===');
    console.log('calculatedScore:', calculatedScore);
    console.log('totalPossibleScore:', totalPossibleScore);
    console.log('percentageScore:', percentageScore);
    console.log('questionResults:', questionResults);

    const testResult = this.testResultRepository.create({
      test,
      user,
      answers: payload.answers,
      score: calculatedScore,
      totalScore: totalPossibleScore,
      percentageScore: percentageScore,
      questionResults,
      submittedAt: new Date(),
    });

    return this.testResultRepository.save(testResult);
  }
}
