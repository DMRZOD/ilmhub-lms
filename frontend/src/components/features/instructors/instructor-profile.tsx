"use client";

import { notFound } from "next/navigation";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CourseCard } from "@/components/features/courses/course-card";
import { Mascot } from "@/components/features/home/mascot";
import { useInstructor } from "@/features/instructors/hooks";

import { InstructorHero } from "./instructor-hero";

export function InstructorProfile({ id }: { id: string }) {
  const { data: instructor, isPending, isError, error, refetch } =
    useInstructor(id);

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-sp-6 px-sp-4 py-sp-10 sm:px-sp-6">
        <Skeleton className="h-48 w-full rounded-ilm-lg" />
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-sp-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-ilm-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-sp-4 px-sp-4 py-sp-16 text-center">
        <h2 className="text-t-24 font-bold text-ilm-ink">
          Ustoz profilini yuklab bo&apos;lmadi
        </h2>
        <Button variant="primary" size="md" onClick={() => refetch()}>
          Qayta yuklash
        </Button>
      </div>
    );
  }

  if (!instructor) return null;

  const bioParagraphs = (instructor.bio ?? "").split("\n\n").filter(Boolean);

  return (
    <>
      <InstructorHero instructor={instructor} />

      <div className="mx-auto flex max-w-7xl flex-col gap-sp-6 px-sp-4 py-sp-8 sm:px-sp-6 lg:py-sp-12">
        <Tabs defaultValue="kurslar">
          <TabsList>
            <TabsTrigger value="kurslar">Kurslar</TabsTrigger>
            <TabsTrigger value="haqida">Haqida</TabsTrigger>
          </TabsList>

          <TabsContent value="kurslar">
            {instructor.courses.length === 0 ? (
              <div className="flex flex-col items-center gap-sp-4 py-sp-16 text-center">
                <div className="grid place-items-center rounded-ilm-2xl bg-ilm-ink p-sp-5">
                  <Mascot variant={3} size={160} className="opacity-90" />
                </div>
                <h3 className="text-t-24 font-bold text-ilm-ink">
                  Hozircha kurslar yo&apos;q
                </h3>
                <p className="max-w-md text-t-14 text-fg-2">
                  Ustoz tez orada yangi kurslar e&apos;lon qiladi.
                </p>
              </div>
            ) : (
              <div className="grid gap-sp-5 sm:grid-cols-2 lg:grid-cols-3">
                {instructor.courses.map((course) => (
                  <CourseCard key={course.id} course={course} view="grid" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="haqida">
            {bioParagraphs.length === 0 ? (
              <p className="text-t-14 text-fg-2">
                Hozircha tarjimai hol qo&apos;shilmagan.
              </p>
            ) : (
              <div className="flex max-w-3xl flex-col gap-sp-4">
                {bioParagraphs.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-t-16 leading-relaxed text-fg-1"
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
