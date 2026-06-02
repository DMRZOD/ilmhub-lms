"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { FieldError } from "@/features/auth/components/FieldError";
import { forgotPassword } from "@/features/auth/api";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas";

export default function ParolTiklashPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await forgotPassword(values);
      setSentTo(values.email);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xato yuz berdi");
    }
  };

  if (sentTo) {
    return (
      <div className="flex flex-col items-start gap-sp-5">
        <span className="grid h-14 w-14 place-content-center rounded-ilm-full bg-ilm-success-bg text-ilm-success">
          <Icon icon={CheckCircle2} size={28} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
            Email yuborildi
          </h1>
          <p className="text-t-14 text-fg-2">
            Parolni tiklash havolasi{" "}
            <span className="font-semibold text-ilm-ink">{sentTo}</span> manziliga
            jo&apos;natildi. Xat kelmadimi? Spam papkasini ham tekshiring.
          </p>
        </div>
        <Button asChild variant="secondary" size="lg" iconLeft={ArrowLeft} className="w-full">
          <Link href="/login">Kirishga qaytish</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-sp-6">
      <header className="flex flex-col gap-2">
        <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
          Parol tiklash
        </span>
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Parolingizni unutdingizmi?
        </h1>
        <p className="text-t-14 text-fg-2">
          Email manzilingizni kiriting — tiklash uchun havola yuboramiz.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-sp-4" noValidate>
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

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
          iconRight={isSubmitting ? undefined : ArrowRight}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Havola yuborish
        </Button>

        <Link
          href="/login"
          className="self-center text-t-12 font-medium text-fg-2 hover:text-ilm-ink"
        >
          Kirishga qaytish
        </Link>
      </form>
    </div>
  );
}
