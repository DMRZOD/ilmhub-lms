/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Lightweight test doubles for unit tests. Services under test are instantiated
 * directly (`new SomeService(...)`) with these mocks, so no Nest DI container or
 * decorator metadata is required.
 */

/**
 * A deeply-mocked PrismaService. Any `prisma.<model>.<method>` access lazily
 * returns a `jest.fn()` you can configure per test (e.g.
 * `prisma.user.findUnique.mockResolvedValue(...)`).
 *
 * `$transaction` supports both call styles used in the codebase:
 *  - array form  → `Promise.all(arg)`
 *  - callback    → `arg(tx)` where `tx` is the same mock client
 */
export function createMockPrisma(): any {
  const models: Record<string, any> = {};

  const makeModel = () =>
    new Proxy(
      {},
      {
        get: (target: any, prop: string) => {
          if (!(prop in target)) target[prop] = jest.fn();
          return target[prop];
        },
      },
    );

  const base: any = {};
  const root: any = new Proxy(base, {
    get: (target: any, prop: string) => {
      if (prop in target) return target[prop];
      if (!models[prop]) models[prop] = makeModel();
      return models[prop];
    },
  });

  base.$transaction = jest.fn((arg: any) =>
    typeof arg === 'function' ? arg(root) : Promise.all(arg),
  );
  base.$executeRawUnsafe = jest.fn();
  base.$queryRaw = jest.fn();

  return root;
}

/** PinoLogger stub (constructors call `setContext` eagerly). */
export function createMockLogger(): any {
  return {
    setContext: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
  };
}

/** ConfigService stub. `get(key)` returns the supplied value. */
export function createMockConfig(values: Record<string, unknown> = {}): any {
  return {
    get: jest.fn((key: string) => values[key]),
    getOrThrow: jest.fn((key: string) => values[key]),
  };
}
