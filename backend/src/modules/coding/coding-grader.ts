import * as vm from 'vm';
import { BadRequestException } from '@nestjs/common';
import { CodingLanguage } from '@prisma/client';
import { transform } from 'sucrase';

/**
 * Pure coding-exercise grader (no DB/Nest service deps), so it can be unit
 * tested in isolation. Tests call a named entry function with JSON arguments and
 * compare the returned value (LeetCode-style).
 */

export interface RawTestCase {
  /** JSON array of arguments passed to the entry function, e.g. "[2, 3]". */
  input: string;
  expectedOutput: string;
  description?: string | null;
  weight?: number;
}

export interface TestResult {
  index: number;
  description: string | null;
  passed: boolean;
  output: string;
  expected: string;
  error?: string;
}

/** The only languages we can execute (JS in-process, TS via type-stripping). */
export const RUNNABLE_LANGUAGES: CodingLanguage[] = [
  CodingLanguage.JS,
  CodingLanguage.TS,
];

export function executeTests(
  code: string,
  tests: RawTestCase[],
  language: CodingLanguage,
  entryFunction: string | null,
): TestResult[] {
  if (!RUNNABLE_LANGUAGES.includes(language)) {
    throw new BadRequestException('language_not_supported_yet');
  }
  if (!entryFunction || !entryFunction.trim()) {
    throw new BadRequestException('exercise_not_configured');
  }
  const fn = entryFunction.trim();

  // TS runs in `vm` only after type annotations are stripped.
  const jsCode = language === CodingLanguage.TS ? stripTypes(code) : code;

  return tests.map((test, index) => runOneTest(jsCode, fn, test, index));
}

function runOneTest(
  jsCode: string,
  entryFunction: string,
  test: RawTestCase,
  index: number,
): TestResult {
  const outputLines: string[] = [];
  const push = (...args: unknown[]) =>
    outputLines.push(args.map(formatValue).join(' '));
  const safeConsole = { log: push, error: push, warn: push };

  const base = {
    index,
    description: test.description ?? null,
    expected: test.expectedOutput,
  };

  // Validate the authored args up front so a bad test reads clearly.
  let args: unknown[];
  try {
    args = parseArgs(test.input);
  } catch {
    return {
      ...base,
      passed: false,
      output: '',
      error: `Test argumentlari JSON massiv bo'lishi kerak: ${test.input}`,
    };
  }

  try {
    const ctx = vm.createContext({ console: safeConsole, __args: args });
    // Run the solution and call the entry function in one script so both
    // `function foo()` declarations and `const foo = …` are in scope.
    const wrapped = `(function(){\n${jsCode}\n;return ${entryFunction}(...__args);\n})()`;
    const result = vm.runInContext(wrapped, ctx, { timeout: 5000 });

    return {
      ...base,
      passed: valuesMatch(result, test.expectedOutput),
      output: formatValue(result),
    };
  } catch (err) {
    return {
      ...base,
      passed: false,
      output: outputLines.join('\n'),
      error: (err as Error).message,
    };
  }
}

/** Strip TypeScript types so the code can run as plain JS in `vm`. */
function stripTypes(code: string): string {
  try {
    return transform(code, {
      transforms: ['typescript'],
      disableESTransforms: true,
    }).code;
  } catch {
    // Let the runtime surface the syntax error per-test instead of failing all.
    return code;
  }
}

/** Parse the authored args string into an arguments array (must be a JSON array). */
function parseArgs(input: string): unknown[] {
  const trimmed = (input ?? '').trim();
  if (trimmed === '') return [];
  const parsed = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) {
    throw new Error('args_not_array');
  }
  return parsed;
}

/** Stable, order-independent stringify for deep value comparison. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys
    .map(
      (k) =>
        `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`,
    )
    .join(',')}}`;
}

/**
 * A run result matches the expected output when their values are equal. We try
 * to read `expected` as JSON (so arrays/objects/numbers compare by value) and
 * fall back to a trimmed string compare (so a plain string answer works too).
 */
function valuesMatch(result: unknown, expectedRaw: string): boolean {
  const expectedTrim = (expectedRaw ?? '').trim();
  try {
    const expected = JSON.parse(expectedTrim);
    return stableStringify(result) === stableStringify(expected);
  } catch {
    return String(result ?? '').trim() === expectedTrim;
  }
}

/** Render a returned value for display (objects/arrays as JSON). */
function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
