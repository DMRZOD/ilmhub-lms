"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Camera, Code2, Globe, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FieldError } from "@/features/auth/components/FieldError";
import { useAuth } from "@/features/auth/hooks";
import {
  profileSchema,
  type ProfileValues,
} from "@/features/users/schemas";
import {
  useUpdateAvatar,
  useUpdateProfile,
} from "@/features/users/hooks";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProfilTab() {
  const { data: user } = useAuth();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      bio: user?.bio ?? "",
      website: "",
      telegram: "",
      github: "",
      twitter: "",
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateProfile.mutateAsync({
        name: values.name,
        bio: values.bio ?? "",
      });
      toast.success("Profil saqlandi");
      reset(values);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Saqlashda xato");
    }
  };

  const onAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Fayl 2 MB dan oshmasligi kerak");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      try {
        await updateAvatar.mutateAsync(dataUrl);
        toast.success("Avatar yangilandi");
      } catch (err) {
        setAvatarPreview(null);
        toast.error(err instanceof Error ? err.message : "Avatar yuklanmadi");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-sp-6">
      <section className="flex flex-col gap-sp-4 rounded-ilm-md border border-ilm-border bg-ilm-surface p-sp-6 sm:flex-row sm:items-center">
        <Avatar
          size="lg"
          ink
          src={avatarPreview ?? user?.avatarUrl ?? undefined}
          alt={user?.name ?? ""}
          initials={initials(user?.name ?? "")}
        />
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="text-t-16 font-semibold text-ilm-ink">Avatar</h3>
          <p className="text-t-12 text-fg-3">
            PNG, JPG yoki WEBP. Maksimal o&apos;lcham 2 MB.
          </p>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={onAvatarPick}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              iconLeft={Camera}
              onClick={() => fileInputRef.current?.click()}
              disabled={updateAvatar.isPending}
            >
              {updateAvatar.isPending ? "Yuklanmoqda..." : "Avatarni o'zgartirish"}
            </Button>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-sp-4"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2"
          >
            Ism
          </label>
          <Field
            id="name"
            placeholder="Ismingiz"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="bio"
            className="text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2"
          >
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            placeholder="O'zingiz haqingizda qisqacha"
            className="rounded-ilm-md bg-ilm-surface px-4 py-3 text-t-14 text-ilm-ink ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-base ease-ilm-out placeholder:text-ilm-muted focus-within:bg-ilm-paper focus-within:ring-ilm-ink focus:outline-none"
            aria-invalid={!!errors.bio}
            {...register("bio")}
          />
          <FieldError message={errors.bio?.message} />
        </div>

        <fieldset className="flex flex-col gap-sp-3 rounded-ilm-md border border-ilm-border p-sp-4">
          <legend className="px-2 text-t-12 font-semibold uppercase tracking-ilm-wide text-fg-2">
            Ijtimoiy tarmoqlar
          </legend>
          <p className="text-t-12 text-fg-3">
            Hozircha faqat ko&apos;rinishda — saqlanmaydi.
          </p>

          <Field icon={Globe} placeholder="https://veb-sayt.uz" {...register("website")} />
          <FieldError message={errors.website?.message} />

          <Field icon={Send} placeholder="@telegram-username" {...register("telegram")} />
          <Field icon={Code2} placeholder="github-username" {...register("github")} />
          <Field icon={AtSign} placeholder="@twitter-username" {...register("twitter")} />
        </fieldset>

        <Button
          type="submit"
          size="lg"
          className="self-start"
          disabled={!isDirty || updateProfile.isPending}
        >
          {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Saqlash
        </Button>
      </form>
    </div>
  );
}
