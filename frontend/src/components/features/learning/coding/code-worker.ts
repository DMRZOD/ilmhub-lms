/// <reference lib="webworker" />

export type WorkerInput = { code: string };
export type WorkerOutput = { output: string; error?: string };

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const lines: string[] = [];
  const fakeConsole = {
    log: (...args: unknown[]) => lines.push(args.map(String).join(" ")),
    error: (...args: unknown[]) =>
      lines.push("[error] " + args.map(String).join(" ")),
    warn: (...args: unknown[]) =>
      lines.push("[warn] " + args.map(String).join(" ")),
  };

  try {
    // eslint-disable-next-line no-new-func
    new Function("console", e.data.code)(fakeConsole);
    const result: WorkerOutput = { output: lines.join("\n") };
    self.postMessage(result);
  } catch (err) {
    const result: WorkerOutput = {
      output: lines.join("\n"),
      error: (err as Error).message,
    };
    self.postMessage(result);
  }
};
