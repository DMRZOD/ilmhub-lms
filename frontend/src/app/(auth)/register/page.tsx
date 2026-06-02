"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { FieldError } from "@/features/auth/components/FieldError";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { useRegister } from "@/features/auth/hooks";
import { dashboardPathForRole } from "@/features/auth/roles";
import { signUpSchema, type SignUpValues } from "@/features/auth/schemas";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const ROLE_OPTIONS: Array<{
  value: "STUDENT" | "INSTRUCTOR";
  title: string;
  hint: string;
}> = [
  { value: "STUDENT", title: "Talaba", hint: "Kurslarni o'rganaman" },
  { value: "INSTRUCTOR", title: "Ustoz", hint: "Kurs yaratmoqchiman" },
];

export default function RoyxatdanOtishPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
      terms: false as unknown as true,
    },
  });

  const passwordValue = watch("password");
  const termsValue = watch("terms");

  const onSubmit = async (values: SignUpValues) => {
    try {
      const data = await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      toast.success("Akkaunt yaratildi");
      router.push(dashboardPathForRole(data.user.role));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ro'yxatdan o'tishda xato");
    }
  };

  const isSubmitting = registerMutation.isPending;

  return (
    <div className="flex flex-col gap-sp-6">
      <header className="flex flex-col gap-2">
        <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
          Hisob yaratish
        </span>
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Ro&apos;yxatdan o&apos;ting
        </h1>
        <p className="text-t-14 text-fg-2">
          Akkauntingiz bormi?{" "}
          <Link
            href="/login"
            className="font-semibold text-ilm-ink underline-offset-4 hover:underline"
          >
            Kirish
          </Link>
          .
        </p>
      </header>

      <GoogleButton
        label="Google bilan ro'yxatdan o'tish"
        onClick={() => {
          window.location.href = `${API_URL}/auth/google`;
        }}
      />
      <AuthDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-sp-4" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
            Ism
          </label>
          <Field
            id="name"
            icon={UserIcon}
            placeholder="Ismingiz"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
            Email
          </label>
          <Field
            id="email"
            type="email"
            icon={Mail}
            placeholder="siz@misol.uz"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
            Parol
          </label>
          <PasswordField
            id="password"
            placeholder="Kamida 8 ta belgi"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <PasswordStrengthMeter value={passwordValue ?? ""} />
          <FieldError message={errors.password?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword" className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
            Parolni takrorlang
          </label>
          <PasswordField
            id="confirmPassword"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
            Rolingiz
          </span>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-2 gap-3"
              >
                {ROLE_OPTIONS.map((opt) => {
                  const selected = field.value === opt.value;
                  return (
                    <label
                      key={opt.value}
                      htmlFor={`role-${opt.value}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-ilm-md border p-4 transition-colors duration-base ease-ilm-out",
                        selected
                          ? "border-ilm-ink bg-ilm-surface"
                          : "border-ilm-border bg-ilm-paper hover:bg-ilm-surface"
                      )}
                    >
                      <RadioGroupItem
                        id={`role-${opt.value}`}
                        value={opt.value}
                        className="mt-1 border-ilm-ink text-ilm-ink"
                      />
                      <span className="flex flex-col">
                        <span className="text-t-14 font-semibold text-ilm-ink">
                          {opt.title}
                        </span>
                        <span className="text-t-12 text-fg-3">{opt.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            )}
          />
          <FieldError message={errors.role?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <label className="flex items-start gap-3 text-t-14 text-fg-2">
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={(v) => field.onChange(v === true)}
                  className="mt-0.5 border-ilm-ink data-[state=checked]:bg-ilm-ink data-[state=checked]:text-ilm-paper"
                />
                <span>
                  <Link href="/terms" className="font-semibold text-ilm-ink underline-offset-4 hover:underline">
                    Foydalanish shartlari
                  </Link>
                  ga roziman.
                </span>
              </label>
            )}
          />
          <FieldError message={errors.terms?.message} />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || termsValue !== true}
          iconRight={isSubmitting ? undefined : ArrowRight}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Ro&apos;yxatdan o&apos;tish
        </Button>
      </form>
    </div>
  );
}
