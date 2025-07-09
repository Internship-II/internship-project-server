// // import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// // import { InjectRepository } from '@nestjs/typeorm';
// // import { Repository, In } from 'typeorm';
// // import { Test } from './entities/test.entity';
// // import { CreateTestDto } from './dto/create-test.dto';
// // import { UpdateTestDto } from './dto/update-test.dto';
// // import { AssignQuestionsDto } from './dto/assign-questions.dto';
// // import { Question } from '../questions/entities/question.entity';

// // @Injectable()
// // export class TestsService {
// //   constructor(
// //     @InjectRepository(Test)
// //     private testsRepository: Repository<Test>,
// //     @InjectRepository(Question)
// //     private questionRepository: Repository<Question>,
// //   ) {}

// //   async findAll() {
// //     return this.testsRepository.find({ relations: ['questions'] });
// //   }

// //   async findOne(id: string) {
// //     const test = await this.testsRepository.findOne({ 
// //       where: { id },
// //       relations: ['questions']
// //     });
// //     if (!test) {
// //       throw new NotFoundException(`Test with ID ${id} not found`);
// //     }
  
// //     await this.assignRandomQuestions(id, test.subject, test.numOfQuestion);
    
// //     const updatedTest = await this.testsRepository.findOne({ 
// //       where: { id },
// //       relations: ['questions']
// //     });
// //     if (!updatedTest) {
// //       throw new NotFoundException(`Test with ID ${id} not found after updating questions`);
// //     }
// //     return updatedTest;
// //   }

// //   async create(createTestDto: CreateTestDto) {
// //     if (!createTestDto.subject || !createTestDto.duration || !createTestDto.numOfQuestion || !createTestDto.questionPerPage) {
// //       throw new BadRequestException('All fields are required');
// //     }

// //     const test = new Test();
// //     test.subject = createTestDto.subject;
// //     test.duration = createTestDto.duration;
// //     test.numOfQuestion = createTestDto.numOfQuestion;
// //     test.questionPerPage = createTestDto.questionPerPage;

// //     // Save the test first
// //     const savedTest = await this.testsRepository.save(test);

// //     // Assign random questions by default unless specific questionIds are provided
// //     if (createTestDto.questionIds && createTestDto.questionIds.length > 0) {
// //       await this.assignQuestions(savedTest.id, { questionIds: createTestDto.questionIds });
// //     } else {
// //       await this.assignRandomQuestions(savedTest.id, createTestDto.subject, createTestDto.numOfQuestion);
// //     }

// //     // Return the test with questions
// //     return this.findOne(savedTest.id);
// //   }

// //   async update(id: string, updateTestDto: UpdateTestDto) {
// //     const test = await this.findOne(id);
    
// //     // Update basic properties
// //     test.subject = updateTestDto.subject || test.subject;
// //     test.duration = updateTestDto.duration || test.duration;
// //     test.numOfQuestion = updateTestDto.numOfQuestion || test.numOfQuestion;
// //     test.questionPerPage = updateTestDto.questionPerPage || test.questionPerPage;

// //     // Save the updated test
// //     await this.testsRepository.save(test);

// //     // Handle question assignment
// //     if (updateTestDto.questionIds && updateTestDto.questionIds.length > 0) {
// //       // Assign specific questions
// //       await this.assignQuestions(id, { questionIds: updateTestDto.questionIds });
// //     } else if (updateTestDto.numOfQuestion && updateTestDto.numOfQuestion !== test.numOfQuestion) {
// //       // Reassign random questions if number of questions changed
// //       await this.assignRandomQuestions(id, test.subject, updateTestDto.numOfQuestion);
// //     }

// //     // Return the updated test with questions
// //     return this.findOne(id);
// //   }

// //   async delete(id: string) {
// //     const test = await this.findOne(id);
// //     await this.testsRepository.remove(test);
// //     return { message: `Test with ID ${id} deleted` };
// //   }

// //   async assignQuestions(id: string, assignQuestionsDto: AssignQuestionsDto) {
// //     const test = await this.findOne(id);
    
// //     // Verify that all question IDs exist
// //     const questions = await this.questionRepository.findBy({ 
// //       id: In(assignQuestionsDto.questionIds) 
// //     });
    
// //     if (questions.length !== assignQuestionsDto.questionIds.length) {
// //       const foundIds = questions.map(q => q.id);
// //       const missingIds = assignQuestionsDto.questionIds.filter(id => !foundIds.includes(id));
// //       throw new BadRequestException(`Questions not found: ${missingIds.join(', ')}`);
// //     }

// //     // Assign questions to the test
// //     test.questions = questions;
    
// //     return this.testsRepository.save(test);
// //   }

// //   async assignRandomQuestions(testId: string, subject: string, numOfQuestions: number) {
// //     // Get all questions for the subject
// //     const allQuestions = await this.questionRepository.find({
// //       where: { subject: subject as any }
// //     });

// //     if (allQuestions.length === 0) {
// //       throw new BadRequestException(`No questions found for subject: ${subject}`);
// //     }

// //     if (allQuestions.length < numOfQuestions) {
// //       throw new BadRequestException(
// //         `Not enough questions for subject ${subject}. Available: ${allQuestions.length}, Requested: ${numOfQuestions}`
// //       );
// //     }

// //     // Shuffle and select random questions using Fisher-Yates shuffle
// //     const shuffledQuestions = this.shuffleArray([...allQuestions]);
// //     const selectedQuestions = shuffledQuestions.slice(0, numOfQuestions);

// //     // Assign the random questions to the test
// //     const test = await this.testsRepository.findOne({ where: { id: testId } });
// //     if (!test) {
// //       throw new NotFoundException(`Test with ID ${testId} not found`);
// //     }
// //     test.questions = selectedQuestions;
    
// //     return this.testsRepository.save(test);
// //   }

// //   private shuffleArray<T>(array: T[]): T[] {
// //     const shuffled = [...array];
// //     for (let i = shuffled.length - 1; i > 0; i--) {
// //       const j = Math.floor(Math.random() * (i + 1));
// //       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
// //     }
// //     return shuffled;
// //   }
// // }


// import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, In } from 'typeorm';
// import { Test } from './entities/test.entity';
// import { CreateTestDto } from './dto/create-test.dto';
// import { UpdateTestDto } from './dto/update-test.dto';
// import { AssignQuestionsDto } from './dto/assign-questions.dto';
// import { Question } from '../questions/entities/question.entity';

// @Injectable()
// export class TestsService {
//   constructor(
//     @InjectRepository(Test)
//     private testsRepository: Repository<Test>,
//     @InjectRepository(Question)
//     private questionRepository: Repository<Question>,
//   ) {}

//   async findAll() {
//     return this.testsRepository.find({ relations: ['questions'] });
//   }

//   async findOne(id: string) {
//     const test = await this.testsRepository.findOne({ 
//       where: { id },
//       relations: ['questions']
//     });
//     if (!test) {
//       throw new NotFoundException(`Test with ID ${id} not found`);
//     }

//     // Get randomized questions without saving them
//     const questions = await this.assignRandomQuestions(id, test.subject, test.numOfQuestion);
    
//     // Return test with randomized questions (not persisted)
//     return { ...test, questions };
//   }

//   async create(createTestDto: CreateTestDto) {
//     if (!createTestDto.subject || !createTestDto.duration || !createTestDto.numOfQuestion || !createTestDto.questionPerPage) {
//       throw new BadRequestException('All fields are required');
//     }

//     const test = new Test();
//     test.subject = createTestDto.subject;
//     test.duration = createTestDto.duration;
//     test.numOfQuestion = createTestDto.numOfQuestion;
//     test.questionPerPage = createTestDto.questionPerPage;

//     // Save the test without questions (questions are assigned on fetch)
//     const savedTest = await this.testsRepository.save(test);

//     // Return the test with questions
//     return this.findOne(savedTest.id);
//   }

//   async update(id: string, updateTestDto: UpdateTestDto) {
//     const test = await this.findOne(id);
    
//     // Update basic properties
//     test.subject = updateTestDto.subject || test.subject;
//     test.duration = updateTestDto.duration || test.duration;
//     test.numOfQuestion = updateTestDto.numOfQuestion || test.numOfQuestion;
//     test.questionPerPage = updateTestDto.questionPerPage || test.questionPerPage;

//     // Save the updated test without modifying questions
//     await this.testsRepository.save(test);

//     // Handle question assignment only if specific questionIds are provided
//     if (updateTestDto.questionIds && updateTestDto.questionIds.length > 0) {
//       await this.assignQuestions(id, { questionIds: updateTestDto.questionIds });
//     }

//     // Return the updated test with questions
//     return this.findOne(id);
//   }

//   async delete(id: string) {
//     const test = await this.findOne(id);
//     await this.testsRepository.remove(test);
//     return { message: `Test with ID ${id} deleted` };
//   }

//   async assignQuestions(id: string, assignQuestionsDto: AssignQuestionsDto) {
//     const test = await this.testsRepository.findOne({ where: { id } });
//     if (!test) {
//       throw new NotFoundException(`Test with ID ${id} not found`);
//     }
    
//     // Verify that all question IDs exist
//     const questions = await this.questionRepository.findBy({ 
//       id: In(assignQuestionsDto.questionIds) 
//     });
    
//     if (questions.length !== assignQuestionsDto.questionIds.length) {
//       const foundIds = questions.map(q => q.id);
//       const missingIds = assignQuestionsDto.questionIds.filter(id => !foundIds.includes(id));
//       throw new BadRequestException(`Questions not found: ${missingIds.join(', ')}`);
//     }

//     // Assign questions to the test (for manual assignment cases)
//     test.questions = questions;
    
//     return this.testsRepository.save(test);
//   }

//   async assignRandomQuestions(testId: string, subject: string, numOfQuestions: number) {
//     // Get all questions for the subject
//     const allQuestions = await this.questionRepository.find({
//       where: { subject: subject as any }
//     });

//     if (allQuestions.length === 0) {
//       throw new BadRequestException(`No questions found for subject: ${subject}`);
//     }

//     if (allQuestions.length < numOfQuestions) {
//       throw new BadRequestException(
//         `Not enough questions for subject ${subject}. Available: ${allQuestions.length}, Requested: ${numOfQuestions}`
//       );
//     }

//     // Shuffle and select random questions using Fisher-Yates shuffle
//     const shuffledQuestions = this.shuffleArray([...allQuestions]);
//     return shuffledQuestions.slice(0, numOfQuestions);
//   }

//   private shuffleArray<T>(array: T[]): T[] {
//     const shuffled = [...array];
//     for (let i = shuffled.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     return shuffled;
//   }
// }




import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from './entities/test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { Question } from '../questions/entities/question.entity';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test)
    private testsRepository: Repository<Test>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async findAll() {
    return this.testsRepository.find();
  }

  async findOne(id: string) {
    const test = await this.testsRepository.findOne({ where: { id } });
    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    return { ...test };
  }

  async create(createTestDto: CreateTestDto) {
    if (!createTestDto.subject || !createTestDto.duration || !createTestDto.numOfQuestion || !createTestDto.questionPerPage) {
      throw new BadRequestException('All fields are required');
    }

    const test = new Test();
    test.subject = createTestDto.subject;
    test.duration = createTestDto.duration;
    test.numOfQuestion = createTestDto.numOfQuestion;
    test.questionPerPage = createTestDto.questionPerPage;

    const savedTest = await this.testsRepository.save(test);
    return this.findOne(savedTest.id);
  }

  async update(id: string, updateTestDto: UpdateTestDto) {
    const test = await this.testsRepository.findOne({ where: { id } });
    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    test.subject = updateTestDto.subject || test.subject;
    test.duration = updateTestDto.duration || test.duration;
    test.numOfQuestion = updateTestDto.numOfQuestion || test.numOfQuestion;
    test.questionPerPage = updateTestDto.questionPerPage || test.questionPerPage;

    await this.testsRepository.save(test);
    return this.findOne(id);
  }

  async delete(id: string) {
    const test = await this.testsRepository.findOne({ where: { id } });
    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
    await this.testsRepository.remove(test);
    return { message: `Test with ID ${id} deleted` };
  }

}