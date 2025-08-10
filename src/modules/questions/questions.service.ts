import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FileStorageService } from '../upload/upload.service';
import { TestResult } from '../test-results/entities/test-result.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(TestResult)
    private testResultsRepository: Repository<TestResult>,
    private fileStorageService: FileStorageService,
  ) {}

  async findAll() {
    return this.questionsRepository.find({ where: { isActive: true } });
  }

  async findOne(id: string, includeInactive: boolean = false) {
    const whereCondition = includeInactive ? { id } : { id, isActive: true };
    const question = await this.questionsRepository.findOne({ where: whereCondition });
    
    if (!question) {
      // Check if the question exists but is inactive
      if (!includeInactive) {
        const inactiveQuestion = await this.questionsRepository.findOne({ where: { id, isActive: false } });
        if (inactiveQuestion) {
          throw new NotFoundException(`Question with ID ${id} is inactive. Use includeInactive=true to view it.`);
        }
      }
      
      // Check if the question exists at all (including hard deleted)
      const anyQuestion = await this.questionsRepository.findOne({ where: { id } });
      if (!anyQuestion) {
        throw new NotFoundException(`Question with ID ${id} not found. It may have been permanently deleted.`);
      }
      
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    
    return question;
  }

  async create(createQuestionDto: CreateQuestionDto, files?: { questionImage?: Express.Multer.File[]; choiceImages?: Express.Multer.File[] }) {
    if (!createQuestionDto.questionText || !createQuestionDto.type || !createQuestionDto.subject || !createQuestionDto.score) {
      throw new BadRequestException('Question text, type, subject, and score are required');
    }

    const question = new Question();
    question.subject = createQuestionDto.subject;
    question.type = createQuestionDto.type;
    question.questionText = createQuestionDto.questionText;
    question.correctAnswer = createQuestionDto.correctAnswer || '';
    question.score = createQuestionDto.score;

    const choices = typeof createQuestionDto.choices === 'string' 
      ? JSON.parse(createQuestionDto.choices) 
      : createQuestionDto.choices || [];
    
    question.choices = choices.map(choice => ({
      text: choice.text || null,
      image: choice.image || null,
      isCorrect: choice.isCorrect || false
    }));

    // Parse matchingPairs if it's a string
    const matchingPairs = typeof createQuestionDto.matchingPairs === 'string'
      ? JSON.parse(createQuestionDto.matchingPairs)
      : createQuestionDto.matchingPairs || [];
    
    question.matchingPairs = matchingPairs.map(pair => ({
      question: pair.question,
      answer: pair.answer
    }));

    // Parse blanks if it's a string
    const blanks = typeof createQuestionDto.blanks === 'string'
      ? JSON.parse(createQuestionDto.blanks)
      : createQuestionDto.blanks || [];
    
    question.blanks = blanks.map(blank => ({
      answer: blank.answer
    }));

    // Handle question image - either from file upload or direct ID
    if (files?.questionImage?.[0]) {
      const uploadedFile = await this.fileStorageService.saveFile(files.questionImage[0]);
      question.questionImage = uploadedFile.id;
    } else if (createQuestionDto.questionImage) {
      // If a file ID is provided directly in the DTO
      question.questionImage = createQuestionDto.questionImage;
    }

    if (files?.choiceImages && choices.length > 0) {
      const uploadedChoiceImages = await Promise.all(
        files.choiceImages.map(file => this.fileStorageService.saveFile(file))
      );
      
      question.choices = choices.map((choice, index) => ({
        text: choice.text || null,
        image: uploadedChoiceImages[index]?.id || null,
        isCorrect: choice.isCorrect || false
      }));
    }

    return this.questionsRepository.save(question);
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto, files?: { questionImage?: Express.Multer.File[]; choiceImages?: Express.Multer.File[] }) {
    const question = await this.findOne(id);
    question.subject = updateQuestionDto.subject || question.subject;
    question.type = updateQuestionDto.type || question.type;
    question.questionText = updateQuestionDto.questionText || question.questionText;
    question.correctAnswer = updateQuestionDto.correctAnswer || question.correctAnswer;
    question.score = updateQuestionDto.score ?? question.score;
    question.choices = (updateQuestionDto.choices || question.choices).map(choice => ({
      text: choice.text || null,
      image: choice.image || null,
      isCorrect: choice.isCorrect || false
    }));
    question.matchingPairs = (updateQuestionDto.matchingPairs || question.matchingPairs).map(pair => ({
      question: pair.question,
      answer: pair.answer
    }));
    question.blanks = (updateQuestionDto.blanks || question.blanks).map(blank => ({
      answer: blank.answer
    }));

    // Handle question image - either from file upload or direct ID
    if (files?.questionImage?.[0]) {
      const uploadedFile = await this.fileStorageService.saveFile(files.questionImage[0]);
      question.questionImage = uploadedFile.id;
    } else if (updateQuestionDto.questionImage) {
      // If a file ID is provided directly in the DTO
      question.questionImage = updateQuestionDto.questionImage;
    }

    if (files?.choiceImages && updateQuestionDto.choices) {
      const uploadedChoiceImages = await Promise.all(
        files.choiceImages.map(file => this.fileStorageService.saveFile(file))
      );
      
      question.choices = updateQuestionDto.choices.map((choice, index) => ({
        text: choice.text || null,
        image: uploadedChoiceImages[index]?.id || null,
        isCorrect: choice.isCorrect || false
      }));
    }

    return this.questionsRepository.save(question);
  }

  async delete(id: string) {
    const question = await this.findOne(id);
    
    // Always soft delete to preserve data integrity
    question.isActive = false;
    question.deletedAt = new Date();
    await this.questionsRepository.save(question);
    return { 
      message: `Question "${question.questionText.substring(0, 50)}..." deactivated successfully.`,
      deactivated: true
    };
  }

  async hardDelete(id: string) {
    const question = await this.findOne(id, true); // Include inactive
    
    // Hard delete - use with caution
    await this.questionsRepository.remove(question);
    return { message: `Question "${question.questionText.substring(0, 50)}..." permanently deleted` };
  }

  async restore(id: string) {
    const question = await this.questionsRepository.findOne({ where: { id, isActive: false } });
    if (!question) {
      throw new NotFoundException(`Deactivated question with ID ${id} not found`);
    }

    question.isActive = true;
    question.deletedAt = null as any;
    await this.questionsRepository.save(question);
    return { message: `Question "${question.questionText.substring(0, 50)}..." restored successfully` };
  }

  async findAllIncludingInactive() {
    return this.questionsRepository.find();
  }

  async checkQuestionExists(id: string) {
    const question = await this.questionsRepository.findOne({ where: { id } });
    if (!question) {
      return { exists: false, message: 'Question not found in database' };
    }
    
    return { 
      exists: true, 
      isActive: question.isActive,
      deletedAt: question.deletedAt,
      message: question.isActive ? 'Question is active' : 'Question is inactive'
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async getShuffledQuestion(id: string) {
    const question = await this.findOne(id);
    
    // Shuffle choices if they exist
    if (question.choices && question.choices.length > 0) {
      question.choices = this.shuffleArray(question.choices);
    }
    
    // Shuffle matching pairs if they exist
    if (question.matchingPairs && question.matchingPairs.length > 0) {
      question.matchingPairs = this.shuffleArray(question.matchingPairs);
    }
    
    return question;
  }

  async getShuffledQuestions(ids: string[]) {
    const questions = await this.questionsRepository.find({
      where: { 
        id: { $in: ids } as any,
        isActive: true 
      }
    });
    
    return questions.map(question => {
      // Shuffle choices if they exist
      if (question.choices && question.choices.length > 0) {
        question.choices = this.shuffleArray(question.choices);
      }
      
      // Shuffle matching pairs if they exist
      if (question.matchingPairs && question.matchingPairs.length > 0) {
        question.matchingPairs = this.shuffleArray(question.matchingPairs);
      }
      
      return question;
    });
  }
}