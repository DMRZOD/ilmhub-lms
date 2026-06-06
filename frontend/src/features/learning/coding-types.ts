export interface CodingTestStub {
  index: number;
  description: string | null;
  /** JSON array of arguments for this case, e.g. "[2, 3]". */
  args: string;
}

export interface CodingExerciseDetail {
  id: string;
  language: string;
  /** Function the tests call, e.g. "add". Null only for legacy/misconfigured rows. */
  entryFunction: string | null;
  starterCode: string;
  /** The student's most recent submission, restored into the editor. */
  lastSubmittedCode: string | null;
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
