import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
  ) {}

  async findAll() {
    return this.questionsRepository.find();
  }

  async findOne(id: string) {
    const question = await this.questionsRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async create(createQuestionDto: CreateQuestionDto, files?: { questionImage?: Express.Multer.File[]; choiceImages?: Express.Multer.File[] }) {
    if (!createQuestionDto.questionText || !createQuestionDto.type || !createQuestionDto.subject) {
      throw new BadRequestException('Question text, type, and subject are required');
    }

    const question = new Question();
    question.subject = createQuestionDto.subject;
    question.type = createQuestionDto.type;
    question.questionText = createQuestionDto.questionText;
    question.correctAnswer = createQuestionDto.correctAnswer || '';

    // Parse choices if it's a string
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

    if (files?.questionImage?.[0]) {
      question.questionImage = files.questionImage[0].path;
    }

    if (files?.choiceImages && choices.length > 0) {
      question.choices = choices.map((choice, index) => ({
        text: choice.text || null,
        image: files.choiceImages?.[index]?.path || null,
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

    if (files?.questionImage?.[0]) {
      question.questionImage = files.questionImage[0].path;
    }

    if (files?.choiceImages && updateQuestionDto.choices) {
      question.choices = updateQuestionDto.choices.map((choice, index) => ({
        text: choice.text || null,
        image: files.choiceImages?.[index]?.path || null,
        isCorrect: choice.isCorrect || false
      }));
    }

    return this.questionsRepository.save(question);
  }

  async delete(id: string) {
    const question = await this.findOne(id);
    await this.questionsRepository.remove(question);
    return { message: `Question with ID ${id} deleted` };
  }
}