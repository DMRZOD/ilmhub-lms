import { api } from "@/lib/api-client";

import type { CertificateVerifyResult } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchCertificateVerify(
  number: string,
): Promise<CertificateVerifyResult> {
  const { data } = await api.get<CertificateVerifyResult>(
    `/certificates/verify/${encodeURIComponent(number)}`,
  );
  return data;
}

/** Public GET endpoint that streams the PDF (lazily generated on first hit). */
export function certificatePublicDownloadUrl(number: string): string {
  return `${API_URL}/certificates/verify/${encodeURIComponent(number)}/download`;
}
