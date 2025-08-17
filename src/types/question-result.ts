
export interface QuestionResult {
      questionId: string;
      isCorrect: boolean;
      score: number;
      reason: string;
    }
    

export interface Test {
  id: string;
  subject: string;
}

export interface Result {
  test: Test;
  score: number;
  totalScore: number;
  percentageScore: number;
  duration: number;
  submittedAt: Date | string;
}
 