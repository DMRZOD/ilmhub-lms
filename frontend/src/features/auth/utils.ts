export type PasswordScore = 0 | 1 | 2 | 3 | 4;

const STRENGTH_LABELS: Record<PasswordScore, string> = {
  0: "Juda zaif",
  1: "Zaif",
  2: "O'rta",
  3: "Yaxshi",
  4: "Kuchli",
};

export function scorePassword(pw: string): { score: PasswordScore; label: string } {
  if (!pw) return { score: 0, label: STRENGTH_LABELS[0] };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const clamped = Math.min(4, score) as PasswordScore;
  return { score: clamped, label: STRENGTH_LABELS[clamped] };
}
