export interface CodingTestStub {
  index: number;
  description: string | null;
}

export interface CodingExerciseDetail {
  id: string;
  language: string;
  starterCode: string;
  tests: CodingTestStub[];
}

export interface TestResult {
  index: number;
  description: string | null;
  passed: boolean;
  output: string;
  expected: string;
  error?: string;
}

export interface SubmitCodeResult {
  passed: boolean;
  weightedScore: number;
  results: TestResult[];
}

export interface SubmitCodeInput {
  code: string;
  solutionViewed?: boolean;
}

export interface SubmissionHistoryItem {
  id: string;
  passed: boolean;
  solutionViewed: boolean;
  createdAt: string;
}

export interface SolutionResponse {
  solutionCode: string;
}
