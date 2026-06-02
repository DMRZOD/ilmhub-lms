import { api } from "@/lib/api-client";

import { instructorApplicationSchema } from "./schemas";
import type {
  CreateInstructorApplicationInput,
  InstructorApplication,
} from "./types";

export async function fetchMyInstructorApplication(): Promise<InstructorApplication | null> {
  const { data } = await api.get("/instructor-applications/me");
  // The endpoint returns `null` (empty body) when the user has no application.
  if (data == null || data === "") return null;
  return instructorApplicationSchema.parse(data);
}

export async function createInstructorApplication(
  input: CreateInstructorApplicationInput,
): Promise<InstructorApplication> {
  const { data } = await api.post("/instructor-applications", input);
  return instructorApplicationSchema.parse(data);
}
