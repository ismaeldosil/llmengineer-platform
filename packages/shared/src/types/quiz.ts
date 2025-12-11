export type QuizQuestionType = 'multiple-choice' | 'true-false';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: QuizOption[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz {
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizAnswerSubmission {
  questionId: string;
  selectedAnswer: string;
}

export interface SubmitQuizRequest {
  answers: QuizAnswerSubmission[];
}

export interface QuizQuestionResult {
  questionId: string;
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  xpBonus: number;
  results: QuizQuestionResult[];
}
