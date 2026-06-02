import { z } from "zod";

const email = z
  .string()
  .min(1, "Email kiritilishi shart")
  .email("Email manzili noto'g'ri");

const passwordStrong = z
  .string()
  .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
  .regex(/[A-Za-zА-Яа-яЎўҚқҒғҲҳ]/, "Parolda kamida bitta harf bo'lishi kerak")
  .regex(/\d/, "Parolda kamida bitta raqam bo'lishi kerak");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Parolni kiriting"),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
    email,
    password: passwordStrong,
    confirmPassword: z.string().min(1, "Parolni takrorlang"),
    role: z.enum(["STUDENT", "INSTRUCTOR"]),
    terms: z.literal(true, {
      message: "Shartlarga rozilik bildirilishi kerak",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Parollar mos kelmadi",
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordStrong,
    confirmPassword: z.string().min(1, "Parolni takrorlang"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Parollar mos kelmadi",
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
