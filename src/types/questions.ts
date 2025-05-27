export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  YES_NO = 'YES_NO',
  MATCHING = 'MATCHING',
  FILL_BLANK = 'FILL_BLANK'
}

export enum SubjectType {
  MATH = 'Math',
  ENGLISH = 'English',
  LOGIC_IQ = 'Logic IQ'
}

export interface Choice {
  text: string | null;
  image: string | null;
  isCorrect: boolean;
}

export interface MatchingPair {
  question: string;
  answer: string;
}

export interface Blank {
  answer: string;
}

export interface Question {
  id: number;
  subject: SubjectType;
  type: QuestionType;
  questionText: string;
  questionImage?: string;
  correctAnswer: string;
  choices?: Choice[];
  matchingPairs?: MatchingPair[];
  blanks?: Blank[];
}