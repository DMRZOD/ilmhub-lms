"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FieldError } from "@/features/auth/components/FieldError";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { useAuth, useLogout } from "@/features/auth/hooks";
import {
  changeEmailSchema,
  changePasswordSchema,
  type ChangeEmailValues,
  type ChangePasswordValues,
} from "@/features/users/schemas";
import {
  useChangePassword,
  useRequestEmailChange,
} from "@/features/users/hooks";

export function HisobTab() {
  const { data: user } = useAuth();
  const requestEmailChange = useRequestEmailChange();
  const changePassword = useChangePassword();
  const logout = useLogout();

  const emailForm = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "" },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onEmailSubmit = async (values: ChangeEmailValues) => {
    try {
      await requestEmailChange.mutateAsync(values.newEmail);
      toast.success("Yangi manzilga tasdiqlash xati yuborildi");
      emailForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xato yuz berdi");
    }
  };

  const onPasswordSubmit = async (values: ChangePasswordValues) => {
    try {
      await changePassword.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      toast.success("Parol yangilandi. Qayta kiring.");
      passwordForm.reset();
      await logout.mutateAsync();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Parolni o'zgartirib bo'lmadi");
    }
  };

  return (
    <div className="flex flex-col gap-sp-8">
      <section className="flex flex-col gap-sp-4">
        <header className="flex flex-col gap-1">
          <h3 className="text-t-16 font-semibold text-ilm-ink">Email manzilini o&apos;zgartirish</h3>
          <p className="text-t-12 text-fg-3">
            Joriy email: <span className="font-semibold text-ilm-ink">{user?.email}</span>. Yangi manzilingizga tasdiqlash xati yuboriladi.
          </p>
        </header>
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className="flex flex-col gap-sp-3"
          noValidate
        >
          <Field
            type="email"
            icon={Mail}
            placeholder="yangi@misol.uz"
            autoComplete="email"
            aria-invalid={!!emailForm.formState.errors.newEmail}
            {...emailForm.register("newEmail")}
          />
          <FieldError message={emailForm.formState.errors.newEmail?.message} />
          <Button
            type="submit"
            size="md"
            className="self-start"
            disabled={requestEmailChange.isPending}
          >
            {requestEmailChange.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Tasdiqlash xatini yuborish
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-sp-4 border-t border-ilm-border pt-sp-6">
        <header className="flex flex-col gap-1">
          <h3 className="text-t-16 font-semibold text-ilm-ink">Parolni o&apos;zgartirish</h3>
          <p className="text-t-12 text-fg-3">
            Yangi parol kamida 8 belgi, kamida bitta harf va bitta raqamdan iborat bo&apos;lishi kerak.
          </p>
        </header>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="flex flex-col gap-sp-3"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <label className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
              Joriy parol
            </label>
            <PasswordField
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!passwordForm.formState.errors.oldPassword}
              {...passwordForm.register("oldPassword")}
            />
            <FieldError message={passwordForm.formState.errors.oldPassword?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
              Yangi parol
            </label>
            <PasswordField
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!passwordForm.formState.errors.newPassword}
              {...passwordForm.register("newPassword")}
            />
            <FieldError message={passwordForm.formState.errors.newPassword?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
              Yangi parolni takrorlang
            </label>
            <PasswordField
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!passwordForm.formState.errors.confirmNewPassword}
              {...passwordForm.register("confirmNewPassword")}
            />
            <FieldError message={passwordForm.formState.errors.confirmNewPassword?.message} />
          </div>

          <Button
            type="submit"
            size="md"
            className="self-start"
            disabled={changePassword.isPending}
          >
            {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Parolni saqlash
          </Button>
        </form>
      </section>
    </div>
  );
}
