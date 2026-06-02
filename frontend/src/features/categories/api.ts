import { api } from "@/lib/api-client";
import {
  categoriesResponseSchema,
  categoryDetailResponseSchema,
  type CategoriesResponse,
  type CategoryDetailResponse,
} from "@/types/api";

export async function fetchCategories(): Promise<CategoriesResponse> {
  const { data } = await api.get("/categories");
  return categoriesResponseSchema.parse(data);
}

export async function fetchCategoryBySlug(
  slug: string,
  page = 1,
  limit?: number,
): Promise<CategoryDetailResponse> {
  const params: Record<string, number> = { page };
  if (limit != null) params.limit = limit;
  const { data } = await api.get(
    `/categories/${encodeURIComponent(slug)}`,
    { params },
  );
  return categoryDetailResponseSchema.parse(data);
}
