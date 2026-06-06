import { BadRequestException } from '@nestjs/common';
import { CodingLanguage } from '@prisma/client';

import { executeTests as run } from './coding-grader';

describe('coding-grader executeTests (entry-function grader)', () => {
  it('passes a correct JS function called with JSON args', () => {
    const results = run(
      'function add(a, b) { return a + b; }',
      [
        { input: '[2, 3]', expectedOutput: '5' },
        { input: '[-1, 1]', expectedOutput: '0' },
      ],
      CodingLanguage.JS,
      'add',
    );
    expect(results.every((r) => r.passed)).toBe(true);
    expect(results[0].output).toBe('5');
  });

  it('fails a wrong solution and reports the diff', () => {
    const [r] = run(
      'function add(a, b) { return a - b; }',
      [{ input: '[2, 3]', expectedOutput: '5' }],
      CodingLanguage.JS,
      'add',
    );
    expect(r.passed).toBe(false);
    expect(r.output).toBe('-1');
    expect(r.expected).toBe('5');
  });

  it('supports const arrow-function solutions', () => {
    const [r] = run(
      'const add = (a, b) => a + b;',
      [{ input: '[2, 3]', expectedOutput: '5' }],
      CodingLanguage.JS,
      'add',
    );
    expect(r.passed).toBe(true);
  });

  it('compares array returns by value', () => {
    const [r] = run(
      'function unique(a) { return [...new Set(a)]; }',
      [{ input: '[[1, 1, 2, 3]]', expectedOutput: '[1, 2, 3]' }],
      CodingLanguage.JS,
      'unique',
    );
    expect(r.passed).toBe(true);
  });

  it('matches a plain string return', () => {
    const [r] = run(
      'function rev(s) { return s.split("").reverse().join(""); }',
      [{ input: '["salom"]', expectedOutput: '"molas"' }],
      CodingLanguage.JS,
      'rev',
    );
    expect(r.passed).toBe(true);
  });

  it('runs TS after stripping types', () => {
    const [r] = run(
      'function unique(arr: number[]): number[] { return [...new Set(arr)]; }',
      [{ input: '[[5, 5, 5]]', expectedOutput: '[5]' }],
      CodingLanguage.TS,
      'unique',
    );
    expect(r.passed).toBe(true);
  });

  it('reports a runtime error per test without throwing', () => {
    const [r] = run(
      'function boom() { throw new Error("nope"); }',
      [{ input: '[]', expectedOutput: '1' }],
      CodingLanguage.JS,
      'boom',
    );
    expect(r.passed).toBe(false);
    expect(r.error).toContain('nope');
  });

  it('flags non-array args clearly instead of crashing', () => {
    const [r] = run(
      'function add(a, b) { return a + b; }',
      [{ input: '2, 3', expectedOutput: '5' }],
      CodingLanguage.JS,
      'add',
    );
    expect(r.passed).toBe(false);
    expect(r.error).toBeTruthy();
  });

  it('rejects unsupported languages', () => {
    expect(() =>
      run('x', [{ input: '[]', expectedOutput: '' }], CodingLanguage.PYTHON, 'x'),
    ).toThrow(BadRequestException);
  });

  it('rejects a missing entry function', () => {
    expect(() =>
      run('x', [{ input: '[]', expectedOutput: '' }], CodingLanguage.JS, null),
    ).toThrow(BadRequestException);
  });
});
