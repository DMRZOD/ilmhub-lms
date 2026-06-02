export type QuizQuestionType = "SINGLE" | "MULTIPLE" | "TEXT";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestionPublic {
  id: string;
  type: QuizQuestionType;
  text: string;
  options: QuizOption[];
  order: number;
}

export interface QuizMyAttemptsSummary {
  used: number;
  remaining: number | null; // null = unlimited
  bestScore: number;
  passed: boolean;
}

export interface QuizDetail {
  id: string;
  lessonId: string;
  passingScore: number;
  attemptsAllowed: number; // 0 = unlimited
  questionCount: number;
  questions: QuizQuestionPublic[];
  myAttempts: QuizMyAttemptsSummary;
}

export interface AnswerInput {
  questionId: string;
  selectedOptionIds?: string[];
  textAnswer?: string;
}

export interface SubmitAttemptInput {
  answers: AnswerInput[];
}

export interface AttemptResultQuestion {
  questionId: string;
  correct: boolean;
  yourSelectedOptionIds: string[];
  yourTextAnswer: string | null;
  correctAnswerIds: string[];
  explanation: string | null;
}

export interface AttemptResult {
  attemptId: string;
  score: number;
  passed: boolean;
  passingScore: number;
  attemptsUsed: number;
  attemptsAllowed: number;
  attemptsRemaining: number | null; // null = unlimited
  revealed: boolean;
  questions: AttemptResultQuestion[];
}

export interface AttemptHistoryItem {
  id: string;
  score: number;
  passed: boolean;
  createdAt: string;
}
