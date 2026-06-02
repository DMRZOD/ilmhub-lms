"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { instructorApplicationKeys } from "@/lib/query-keys";

import {
  createInstructorApplication,
  fetchMyInstructorApplication,
} from "./api";

export function useMyInstructorApplication() {
  return useQuery({
    queryKey: instructorApplicationKeys.me(),
    queryFn: fetchMyInstructorApplication,
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateInstructorApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInstructorApplication,
    onSuccess: (application) => {
      qc.setQueryData(instructorApplicationKeys.me(), application);
    },
  });
}
