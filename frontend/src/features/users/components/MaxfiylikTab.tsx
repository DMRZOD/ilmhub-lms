"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FieldError } from "@/features/auth/components/FieldError";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { useLogout } from "@/features/auth/hooks";
import { useDeleteAccount } from "@/features/users/hooks";
import {
  deleteAccountSchema,
  type DeleteAccountValues,
} from "@/features/users/schemas";

export function MaxfiylikTab() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const deleteAccount = useDeleteAccount();
  const logout = useLogout();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: DeleteAccountValues) => {
    try {
      await deleteAccount.mutateAsync(values.password);
      await logout.mutateAsync().catch(() => undefined);
      toast.success("Akkaunt o'chirildi");
      reset();
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "O'chirib bo'lmadi");
    }
  };

  // Real export job lands in step 32/36 — for now we only notify the user.
  const onExport = () => {
    toast.info("Eksport tayyorlanmoqda — tayyor bo'lgach emailga yuboriladi");
  };

  return (
    <div className="flex flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-4 rounded-ilm-md border border-ilm-border bg-ilm-paper p-sp-6">
        <header className="flex flex-col gap-1">
          <h3 className="text-t-16 font-semibold text-ilm-ink">
            Ma&apos;lumotlarni eksport qilish (GDPR)
          </h3>
          <p className="text-t-12 text-fg-2">
            Profilingiz, yozilgan kurslaringiz, sharhlaringiz va sertifikatlaringiz JSON ko&apos;rinishida tayyorlanadi va emailingizga yuboriladi.
          </p>
        </header>
        <Button
          type="button"
          variant="secondary"
          size="md"
          iconLeft={Download}
          className="self-start"
          onClick={onExport}
        >
          Ma&apos;lumotlarni eksport qilish
        </Button>
      </div>

      <div className="flex flex-col gap-sp-4 rounded-ilm-md border border-ilm-error-bg bg-ilm-error-bg/30 p-sp-6">
        <header className="flex flex-col gap-1">
        <h3 className="text-t-16 font-semibold text-ilm-error">Akkauntni o&apos;chirish</h3>
        <p className="text-t-12 text-fg-2">
          Akkaunt o&apos;chirilgach, profilingiz, sozlamalaringiz va aktivlik tarixingiz qaytarib bo&apos;lmaydigan tarzda yo&apos;qoladi.
        </p>
      </header>

      <Button
        type="button"
        variant="primary"
        size="md"
        iconLeft={Trash2}
        className="self-start bg-ilm-error text-white hover:bg-ilm-error/90"
        onClick={() => setOpen(true)}
      >
        Akkauntni o&apos;chirish
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-w-xl mx-auto">
          <SheetHeader>
            <SheetTitle>Akkauntni o&apos;chirishni tasdiqlang</SheetTitle>
            <SheetDescription>
              Tasdiqlash uchun joriy parolingizni kiriting. Bu amalni qaytarib bo&apos;lmaydi.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-sp-4 flex flex-col gap-sp-3"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <label className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
                Joriy parol
              </label>
              <PasswordField
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>

            <SheetFooter className="mt-sp-3 gap-sp-2 sm:gap-sp-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setOpen(false)}
                disabled={deleteAccount.isPending}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                size="md"
                className="bg-ilm-error text-white hover:bg-ilm-error/90"
                disabled={deleteAccount.isPending}
              >
                {deleteAccount.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Akkauntni o&apos;chirish
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      </div>
    </div>
  );
}
