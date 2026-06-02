"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCertificateVerify } from "./api";

export function useCertificateVerify(number: string) {
  return useQuery({
    queryKey: ["certificates", "verify", number],
    queryFn: () => fetchCertificateVerify(number),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(number),
  });
}
