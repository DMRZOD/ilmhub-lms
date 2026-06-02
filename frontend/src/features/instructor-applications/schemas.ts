import { z } from "zod";

/** Server response shape for an instructor application. */
export const instructorApplicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  bio: z.string(),
  expertise: z.string(),
  sampleWorkUrls: z.array(z.string()),
  rejectedReason: z.string().nullable(),
  decidedAt: z.string().nullable(),
  createdAt: z.string(),
});

/** Client-side form schema (matches backend CreateInstructorApplicationDto). */
export const instructorApplicationFormSchema = z.object({
  bio: z
    .string()
    .min(50, "Bio kamida 50 ta belgidan iborat bo'lishi kerak")
    .max(2000, "Bio juda uzun"),
  expertise: z
    .array(z.string())
    .min(1, "Kamida bitta yo'nalish tanlang")
    .max(20),
  links: z
    .array(z.string().url("URL noto'g'ri").or(z.literal("")))
    .max(20),
});

export type InstructorApplicationFormValues = z.infer<
  typeof instructorApplicationFormSchema
>;
