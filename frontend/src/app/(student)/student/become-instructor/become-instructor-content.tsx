"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  Link2,
  Loader2,
  Plus,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { FieldError } from "@/features/auth/components/FieldError";
import { useAuth } from "@/features/auth/hooks";
import { useCategories } from "@/features/categories/hooks";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/format";

import {
  instructorApplicationFormSchema,
  type InstructorApplicationFormValues,
} from "@/features/instructor-applications/schemas";
import {
  useCreateInstructorApplication,
  useMyInstructorApplication,
} from "@/features/instructor-applications/hooks";

function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Loader2 className="h-8 w-8 animate-spin text-ilm-ink" />
    </div>
  );
}

function StatusCard({
  icon: StatusIcon,
  tone,
  title,
  children,
  action,
}: {
  icon: typeof Clock;
  tone: "info" | "success" | "error";
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const toneClasses = {
    info: "bg-ilm-surface text-ilm-ink",
    success: "bg-ilm-success-bg text-ilm-success",
    error: "bg-ilm-error-bg text-ilm-error",
  }[tone];

  return (
    <Card padding="lg" className="flex flex-col items-center gap-sp-5 text-center">
      <span className={cn("grid h-16 w-16 place-items-center rounded-ilm-full", toneClasses)}>
        <StatusIcon className="h-8 w-8" />
      </span>
      <div className="flex flex-col gap-sp-2">
        <h1 className="text-t-24 font-extrabold text-ilm-ink">{title}</h1>
        <div className="text-t-14 text-fg-2">{children}</div>
      </div>
      {action}
    </Card>
  );
}

export function UstozBolishContent() {
  const { data: user, isLoading: authLoading } = useAuth();
  const { data: application, isLoading: appLoading } =
    useMyInstructorApplication();
  const { data: categories } = useCategories();
  const createApplication = useCreateInstructorApplication();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InstructorApplicationFormValues>({
    resolver: zodResolver(instructorApplicationFormSchema),
    defaultValues: { bio: "", expertise: [], links: [""] },
  });

  if (authLoading || appLoading) return <PageLoader />;

  const isInstructor = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  if (isInstructor) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <StatusCard
          icon={GraduationCap}
          tone="success"
          title="Siz allaqachon ustozsiz"
          action={
            <Button asChild size="lg" iconRight={ArrowRight}>
              <Link href="/instructor/dashboard">Ustoz paneliga o&apos;tish</Link>
            </Button>
          }
        >
          Sizning hisobingiz ustoz huquqlariga ega.
        </StatusCard>
      </div>
    );
  }

  if (application?.status === "PENDING") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <StatusCard
          icon={Clock}
          tone="info"
          title="Arizangiz ko'rib chiqilmoqda"
          action={
            <Button asChild variant="secondary" size="lg">
              <Link href="/student/dashboard">Bosh sahifaga qaytish</Link>
            </Button>
          }
        >
          Arizangiz {formatShortDate(application.createdAt)} sanasida yuborildi.
          Tez orada admin uni ko&apos;rib chiqadi va sizga xabar beramiz.
        </StatusCard>
      </div>
    );
  }

  if (application?.status === "APPROVED") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <StatusCard
          icon={CheckCircle2}
          tone="success"
          title="Arizangiz tasdiqlandi"
          action={
            <Button asChild size="lg" iconRight={ArrowRight}>
              <Link href="/instructor/dashboard">Ustoz paneliga o&apos;tish</Link>
            </Button>
          }
        >
          Tabriklaymiz! Endi siz o&apos;z kurslaringizni yaratishingiz mumkin.
        </StatusCard>
      </div>
    );
  }

  const onSubmit = async (values: InstructorApplicationFormValues) => {
    const links = values.links
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    try {
      await createApplication.mutateAsync({
        bio: values.bio,
        expertise: values.expertise,
        links,
      });
      toast.success("Arizangiz yuborildi");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error("Sizda allaqachon faol ariza bor yoki siz ustozsiz");
      } else {
        toast.error("Arizani yuborishda xatolik yuz berdi");
      }
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-sp-6">
      <div className="flex flex-col gap-sp-2">
        <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-3">
          Ustoz bo&apos;lish
        </span>
        <h1 className="text-t-32 font-extrabold tracking-ilm-tight text-ilm-ink">
          Ustozlikka ariza
        </h1>
        <p className="text-t-14 text-fg-2">
          O&apos;zingiz haqingizda gapirib bering va tajriba yo&apos;nalishlaringizni
          tanlang. Admin arizangizni ko&apos;rib chiqadi.
        </p>
      </div>

      {application?.status === "REJECTED" && (
        <Card padding="md" className="flex items-start gap-sp-3 bg-ilm-error-bg">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-ilm-error" />
          <div className="flex flex-col gap-1">
            <h3 className="text-t-14 font-bold text-ilm-ink">
              Oldingi arizangiz rad etilgan
            </h3>
            {application.rejectedReason && (
              <p className="text-t-14 text-fg-2">
                Sabab: {application.rejectedReason}
              </p>
            )}
            <p className="text-t-12 text-fg-3">
              Quyida ma&apos;lumotlarni yangilab, qaytadan yuborishingiz mumkin.
            </p>
          </div>
        </Card>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-sp-6"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="bio"
            className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2"
          >
            Bio
          </label>
          <textarea
            id="bio"
            rows={5}
            placeholder="Tajribangiz, ish joyingiz, yutuqlaringiz haqida yozing (kamida 50 ta belgi)"
            className="rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 text-ilm-ink ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-base ease-ilm-out placeholder:text-ilm-muted focus-within:bg-ilm-paper focus-within:ring-ilm-ink focus:outline-none"
            aria-invalid={!!errors.bio}
            {...register("bio")}
          />
          <FieldError message={errors.bio?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
            Tajriba yo&apos;nalishlari
          </span>
          <Controller
            control={control}
            name="expertise"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {categories?.map((cat) => {
                  const selected = field.value.includes(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        field.onChange(
                          selected
                            ? field.value.filter((v) => v !== cat.name)
                            : [...field.value, cat.name],
                        )
                      }
                      className={cn(
                        "rounded-ilm-full px-4 py-2 text-t-14 font-medium ring-1 ring-inset transition-colors duration-base ease-ilm-out",
                        selected
                          ? "bg-ilm-ink text-white ring-ilm-ink"
                          : "bg-ilm-surface text-ilm-ink ring-ilm-border hover:bg-ilm-border/40",
                      )}
                      aria-pressed={selected}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          />
          <FieldError message={errors.expertise?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
            Havolalar
          </span>
          <p className="text-t-12 text-fg-3">
            Portfolio, ijtimoiy tarmoqlar, oldingi video darslaringiz va h.k.
          </p>
          <Controller
            control={control}
            name="links"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {field.value.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Field
                      icon={Link2}
                      placeholder="https://..."
                      value={url}
                      wrapperClassName="flex-1"
                      onChange={(e) => {
                        const next = [...field.value];
                        next[index] = e.target.value;
                        field.onChange(next);
                      }}
                    />
                    {field.value.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(
                            field.value.filter((_, i) => i !== index),
                          )
                        }
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-ilm-md text-fg-3 transition-colors hover:bg-ilm-surface hover:text-ilm-ink"
                        aria-label="Havolani o'chirish"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {field.value.length < 20 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    iconLeft={Plus}
                    className="self-start"
                    onClick={() => field.onChange([...field.value, ""])}
                  >
                    Havola qo&apos;shish
                  </Button>
                )}
              </div>
            )}
          />
          <FieldError
            message={
              errors.links
                ? "Havolalar to'g'ri URL ko'rinishida bo'lishi kerak"
                : undefined
            }
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="self-start"
          disabled={createApplication.isPending}
        >
          {createApplication.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Arizani yuborish
        </Button>
      </form>
    </div>
  );
}
