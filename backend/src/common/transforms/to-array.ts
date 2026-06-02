import type { TransformFnParams } from 'class-transformer';

export function toArray({ value }: TransformFnParams): unknown {
  if (value === undefined || value === null) return value;
  if (Array.isArray(value)) {
    return value.flatMap((v) =>
      typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : [v],
    );
  }
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [value];
}
