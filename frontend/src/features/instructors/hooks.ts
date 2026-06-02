"use client";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { instructorsKeys } from "@/lib/query-keys";
import type { InstructorFiltersInput } from "@/types/api";

import { fetchInstructorById, fetchInstructors } from "./api";

function isNotFound(err: unknown): boolean {
  return err instanceof AxiosError && err.response?.status === 404;
}

export function useInstructors(filters: InstructorFiltersInput = {}) {
  return useQuery({
    queryKey: instructorsKeys.list(filters),
    queryFn: () => fetchInstructors(filters),
  });
}

export function useInstructor(id: string | null | undefined) {
  return useQuery({
    queryKey: instructorsKeys.detail(id ?? ""),
    queryFn: () => fetchInstructorById(id as string),
    enabled: Boolean(id),
    retry: (count, err) => !isNotFound(err) && count < 1,
  });
}
