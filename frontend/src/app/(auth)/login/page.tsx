"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { AuthDivider } from "@/features/auth/components/AuthDivider";
import { FieldError } from "@/features/auth/components/FieldError";
import { GoogleButton } from "@/features/auth/components/GoogleButton";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { useLogin } from "@/features/auth/hooks";
import { dashboardPathForRole } from "@/features/auth/roles";
import { signInSchema, type SignInValues } from "@/features/auth/schemas";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function KirishInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    try {
      const data = await login.mutateAsync(values);
      toast.success("Xush kelibsiz!");
      const from = searchParams.get("from");
      router.push(
        from && from.startsWith("/")
          ? from
          : dashboardPathForRole(data.user.role),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kirishda xato yuz berdi");
    }
  };

  const isSubmitting = login.isPending;

  return (
    <div className="flex flex-col gap-sp-6">
      <header className="flex flex-col gap-2">
        <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
          Xush kelibsiz
        </span>
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Hisobingizga kiring
        </h1>
        <p className="text-t-14 text-fg-2">
          Akkauntingiz yo&apos;qmi?{" "}
          <Link
            href="/register"
            className="font-semibold text-ilm-ink underline-offset-4 hover:underline"
          >
            Ro&apos;yxatdan o&apos;ting
          </Link>
          .
        </p>
      </header>

      <GoogleButton
        onClick={() => {
          window.location.href = `${API_URL}/auth/google`;
        }}
      />
      <AuthDivider />

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

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
              Parol
            </label>
            <Link
              href="/reset-password"
              className="text-t-12 font-medium text-ilm-ink underline-offset-4 hover:underline"
            >
              Parolni unutdingizmi?
            </Link>
          </div>
          <PasswordField
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
          iconRight={isSubmitting ? undefined : ArrowRight}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Kirish
        </Button>
      </form>
    </div>
  );
}

export default function KirishPage() {
  return (
    <Suspense fallback={null}>
      <KirishInner />
    </Suspense>
  );
}
