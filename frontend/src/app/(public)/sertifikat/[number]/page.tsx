import type { Metadata } from "next";

import { CertificateVerifyContent } from "@/components/features/certificate/certificate-verify-content";

type RouteParams = { number: string };

export const metadata: Metadata = {
  title: "Sertifikatni tekshirish — IlmHub",
  description: "IlmHub sertifikatining haqiqiyligini tekshiring.",
};

export default async function CertificateVerifyPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { number } = await params;
  return <CertificateVerifyContent number={number} />;
}
