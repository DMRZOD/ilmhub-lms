import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(100, "Ism juda uzun"),
  bio: z
    .string()
    .max(500, "Bio 500 ta belgidan oshmasligi kerak")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Veb-sayt URL noto'g'ri")
    .optional()
    .or(z.literal("")),
  telegram: z.string().max(64).optional().or(z.literal("")),
  github: z.string().max(64).optional().or(z.literal("")),
  twitter: z.string().max(64).optional().or(z.literal("")),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Joriy parolni kiriting"),
    newPassword: z
      .string()
      .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
      .regex(/[A-Za-zА-Яа-яЎўҚқҒғҲҳ]/, "Parolda kamida bitta harf bo'lishi kerak")
      .regex(/\d/, "Parolda kamida bitta raqam bo'lishi kerak"),
    confirmNewPassword: z.string().min(1, "Yangi parolni takrorlang"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Parollar mos kelmadi",
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .min(1, "Email kiritilishi shart")
    .email("Email manzili noto'g'ri"),
});
export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Parolni kiriting"),
});
export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
