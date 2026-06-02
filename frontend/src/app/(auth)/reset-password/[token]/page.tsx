"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FieldError } from "@/features/auth/components/FieldError";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { PasswordStrengthMeter } from "@/features/auth/components/PasswordStrengthMeter";
import { resetPassword } from "@/features/auth/api";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";

export default function ParolTiklashTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await resetPassword({ token, password: values.password });
      setDone(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xato yuz berdi");
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-start gap-sp-5">
        <span className="grid h-14 w-14 place-content-center rounded-ilm-full bg-ilm-success-bg text-ilm-success">
          <Icon icon={CheckCircle2} size={28} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            Parol yangilandi
          </h1>
          <p className="text-t-14 text-fg-2">
            Endi yangi parolingiz bilan kirishingiz mumkin.
          </p>
        </div>
        <Button asChild size="lg" className="w-full" iconRight={ArrowRight}>
          <Link href="/login">Kirishga o&apos;tish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <header className="flex flex-col gap-2">
        <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
          Yangi parol
        </span>
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Parolni o&apos;rnating
        </h1>
        <p className="text-t-14 text-fg-2">
          Hisobingiz uchun yangi parolni kiriting.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-sp-4" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
            Yangi parol
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

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
          iconRight={isSubmitting ? undefined : ArrowRight}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Parolni saqlash
        </Button>
      </form>
    </div>
  );
}
