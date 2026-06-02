import { api } from "@/lib/api-client";
import {
  instructorDetailSchema,
  instructorListResponseSchema,
  type InstructorDetail,
  type InstructorFiltersInput,
  type InstructorListResponse,
} from "@/types/api";

function toParams(filters: InstructorFiltersInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (filters.page != null) out.page = filters.page;
  if (filters.limit != null) out.limit = filters.limit;
  if (filters.search) out.search = filters.search;
  if (filters.sort) out.sort = filters.sort;
  return out;
}

export async function fetchInstructors(
  filters: InstructorFiltersInput = {},
): Promise<InstructorListResponse> {
  const { data } = await api.get("/instructors", { params: toParams(filters) });
  return instructorListResponseSchema.parse(data);
}

export async function fetchInstructorById(id: string): Promise<InstructorDetail> {
  const { data } = await api.get(`/instructors/${encodeURIComponent(id)}`);
  return instructorDetailSchema.parse(data);
}
