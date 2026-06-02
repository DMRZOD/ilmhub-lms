// Certificate numbers follow the spec format `IH-YYYY-NNNNN`, e.g. IH-2026-04217.
// The 5-digit suffix is random; callers retry on the unique-constraint conflict
// on `Certificate.certificateNumber` (collisions are rare).

export function generateCertificateNumber(issuedAt: Date = new Date()): string {
  const year = issuedAt.getFullYear();
  const suffix = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `IH-${year}-${suffix}`;
}
