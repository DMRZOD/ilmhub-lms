export type ValidCertificate = {
  valid: true;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  pdfUrl: string | null;
};

export type CertificateVerifyResult =
  | { valid: false; certificateNumber: string }
  | ValidCertificate;
