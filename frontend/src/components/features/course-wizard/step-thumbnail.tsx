"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadCourseImage } from "@/features/course-wizard/api";
import type { UpdateCoursePayload } from "@/features/course-wizard/api";
import type { WizardCourse } from "@/features/course-wizard/schemas";
import { cn } from "@/lib/utils";
import { HINT_CLASS, LABEL_CLASS } from "./field-styles";

export function StepThumbnail({
  course,
  save,
}: {
  course: WizardCourse;
  save: (payload: UpdateCoursePayload) => void;
}) {
  const [preview, setPreview] = useState<string | null>(course.thumbnailUrl);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: (file: File) => uploadCourseImage(file),
    onSuccess: (res) => {
      setPreview(res.url);
      save({ thumbnailUrl: res.url });
      toast.success("Rasm yuklandi");
    },
    onError: (err) => {
      const code = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      const messages: Record<string, string> = {
        storage_not_configured:
          "Rasm xotirasi sozlanmagan (Supabase). Administrator bilan bog'laning.",
        image_too_large: "Rasm hajmi 5 MB dan oshmasligi kerak",
        unsupported_image_type: "Faqat PNG, JPG yoki WebP qabul qilinadi",
      };
      toast.error((code && messages[code]) || "Rasmni yuklab bo'lmadi");
    },
  });

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari qabul qilinadi");
      return;
    }
    upload.mutate(file);
  };

  return (
    <div className="flex max-w-2xl flex-col gap-sp-3">
      <label className={LABEL_CLASS}>Kurs muqovasi</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative grid aspect-video w-full cursor-pointer place-items-center overflow-hidden rounded-ilm-2xl border-2 border-dashed border-ilm-border bg-ilm-surface transition",
          dragOver && "border-ilm-ink bg-ilm-paper",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Muqova"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-sp-2 text-fg-3">
            <ImageIcon className="h-8 w-8" />
            <p className="text-t-14">Rasmni shu yerga tashlang yoki tanlang</p>
          </div>
        )}

        {upload.isPending && (
          <div className="absolute inset-0 grid place-items-center bg-black/40">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex items-center gap-sp-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          iconLeft={Upload}
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
        >
          Rasm tanlash
        </Button>
        <span className={HINT_CLASS}>
          16:9, PNG/JPG/WebP, 5 MB gacha — 1280×720 ga moslashtiriladi
        </span>
      </div>
    </div>
  );
}
