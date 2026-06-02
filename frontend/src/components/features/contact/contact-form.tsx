"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgi bo'lishi kerak"),
  email: z.string().email("Noto'g'ri email manzili"),
  subject: z.string().min(2, "Mavzu majburiy"),
  message: z.string().min(10, "Xabar kamida 10 ta belgidan iborat bo'lsin"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = (values: ContactFormValues) => {
    console.log("contact form submitted", values);
    toast.success("Xabaringiz yuborildi", {
      description: "Tez orada siz bilan bog'lanamiz.",
    });
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-sp-5 rounded-ilm-2xl bg-ilm-surface p-sp-6 md:p-sp-8"
    >
      <div className="flex flex-col gap-sp-2">
        <label htmlFor="contact-name" className="text-t-14 font-semibold text-ilm-ink">
          Ismingiz
        </label>
        <Field
          id="contact-name"
          placeholder="Sardor Yo'ldoshev"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-t-12 font-medium text-error">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-sp-2">
        <label htmlFor="contact-email" className="text-t-14 font-semibold text-ilm-ink">
          Email
        </label>
        <Field
          id="contact-email"
          type="email"
          placeholder="sizning@email.uz"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-t-12 font-medium text-error">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-sp-2">
        <label htmlFor="contact-subject" className="text-t-14 font-semibold text-ilm-ink">
          Mavzu
        </label>
        <Field
          id="contact-subject"
          placeholder="Hamkorlik taklifi"
          aria-invalid={Boolean(errors.subject)}
          {...register("subject")}
        />
        {errors.subject && (
          <p className="text-t-12 font-medium text-error">{errors.subject.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-sp-2">
        <label htmlFor="contact-message" className="text-t-14 font-semibold text-ilm-ink">
          Xabar
        </label>
        <textarea
          id="contact-message"
          rows={6}
          placeholder="Bizga yozmoqchi bo'lgan har qanday savol yoki taklifingizni yozing..."
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
          className={cn(
            "min-h-[140px] resize-y rounded-ilm-md bg-ilm-paper px-4 py-3 text-t-14 font-medium text-ilm-ink ring-1 ring-inset ring-transparent outline-none transition-[box-shadow,background-color] duration-base ease-ilm-out placeholder:font-medium placeholder:text-ilm-muted focus:ring-ilm-ink"
          )}
        />
        {errors.message && (
          <p className="text-t-12 font-medium text-error">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Yuborilmoqda..." : "Xabar yuborish"}
      </Button>
    </form>
  );
}
