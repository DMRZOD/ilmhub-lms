// Helpers for sharing a certificate. `shareUrl` is the public verification page.

export function linkedInShareUrl(shareUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
}

export function telegramShareUrl(shareUrl: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
}

export interface LinkedInAddToProfileInput {
  courseTitle: string;
  certificateNumber: string;
  /** Public verification URL, used as the credential URL. */
  verifyUrl: string;
  /** ISO date string. */
  issuedAt: string;
}

/** Deep link into LinkedIn's "Add to profile" certification flow, prefilled. */
export function linkedInAddToProfileUrl({
  courseTitle,
  certificateNumber,
  verifyUrl,
  issuedAt,
}: LinkedInAddToProfileInput): string {
  const issued = new Date(issuedAt);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: courseTitle,
    organizationName: "IlmHub",
    issueYear: String(issued.getFullYear()),
    issueMonth: String(issued.getMonth() + 1),
    certUrl: verifyUrl,
    certId: certificateNumber,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}
