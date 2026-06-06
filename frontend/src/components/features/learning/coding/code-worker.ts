/// <reference lib="webworker" />

import { transform } from "sucrase";

export type WorkerCase = { index: number; args: string };

export type WorkerInput = {
  code: string;
  language: string;
  entryFunction: string;
  cases: WorkerCase[];
};

export type WorkerCaseResult = {
  index: number;
  output: string;
  logs?: string;
  error?: string;
};

export type WorkerOutput = { results: WorkerCaseResult[] };

function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** TS only runs after type annotations are stripped. */
function toJs(code: string, language: string): string {
  if (language === "TS") {
    return transform(code, {
      transforms: ["typescript"],
      disableESTransforms: true,
    }).code;
  }
  return code;
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { code, language, entryFunction, cases } = e.data;

  let jsCode: string;
  try {
    jsCode = toJs(code, language);
  } catch (err) {
    // A whole-file syntax error blocks every case.
    const error = (err as Error).message;
    const out: WorkerOutput = {
      results: cases.map((c) => ({ index: c.index, output: "", error })),
    };
    self.postMessage(out);
    return;
  }

  const fn = (entryFunction || "").trim();

  const results: WorkerCaseResult[] = cases.map((c) => {
    const logLines: string[] = [];
    const fakeConsole = {
      log: (...a: unknown[]) => logLines.push(a.map(formatValue).join(" ")),
      error: (...a: unknown[]) => logLines.push(a.map(formatValue).join(" ")),
      warn: (...a: unknown[]) => logLines.push(a.map(formatValue).join(" ")),
    };
    const logs = () => (logLines.length ? logLines.join("\n") : undefined);

    let args: unknown[];
    try {
      const parsed = JSON.parse((c.args || "").trim() || "[]");
      if (!Array.isArray(parsed)) throw new Error("not_array");
      args = parsed;
    } catch {
      return {
        index: c.index,
        output: "",
        error: `Argumentlar JSON massiv bo'lishi kerak: ${c.args}`,
      };
    }

    try {
      // Run the solution and call the entry function in one scope so both
      // `function foo()` declarations and `const foo = …` are visible.
      const body = `return (function(){\n${jsCode}\n;return ${fn}(...__args);\n})();`;
      const runner = new Function("console", "__args", body);
      const result = runner(fakeConsole, args);
      return { index: c.index, output: formatValue(result), logs: logs() };
    } catch (err) {
      return {
        index: c.index,
        output: "",
        logs: logs(),
        error: (err as Error).message,
      };
    }
  });

  self.postMessage({ results } satisfies WorkerOutput);
};
