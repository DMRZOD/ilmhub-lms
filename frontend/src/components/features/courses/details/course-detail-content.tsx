"use client";

import { notFound } from "next/navigation";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/features/courses/hooks";

import { CourseDetailHero } from "./course-detail-hero";
import { CourseDetailTabs } from "./course-detail-tabs";
import { CourseRequirements } from "./course-requirements";
import { CourseSidebar } from "./course-sidebar";
import { CourseStickyBuyBar } from "./course-sticky-buybar";
import { SimilarCourses } from "./similar-courses";

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-sp-4 pb-24 pt-sp-10 md:px-sp-6 md:pb-sp-16 md:pt-sp-14 lg:pb-sp-20">
      <div className="grid gap-sp-10 lg:grid-cols-12 lg:gap-sp-12">
        <div className="flex flex-col gap-sp-6 lg:col-span-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full max-w-2xl" />
          <Skeleton className="h-64 w-full" />
        </div>
        <aside className="lg:col-span-4">
          <Skeleton className="h-[480px] w-full rounded-ilm-lg" />
        </aside>
      </div>
    </div>
  );
}

export function CourseDetailContent({ slug }: { slug: string }) {
  const { data: course, isPending, isError, error, refetch } = useCourse(slug);

  if (isPending) return <DetailSkeleton />;

  if (isError) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-sp-4 px-sp-4 py-sp-16 text-center">
        <h2 className="text-t-24 font-bold text-ilm-ink">
          Kursni yuklab bo&apos;lmadi
        </h2>
        <p className="text-t-14 text-fg-2">
          Internet ulanishingizni tekshiring va qaytadan urinib ko&apos;ring.
        </p>
        <Button variant="primary" size="md" onClick={() => refetch()}>
          Qayta yuklash
        </Button>
      </div>
    );
  }

  if (!course) return null;

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-sp-4 pb-24 pt-sp-10 md:px-sp-6 md:pb-sp-16 md:pt-sp-14 lg:pb-sp-20">
        <div className="grid gap-sp-10 lg:grid-cols-12 lg:gap-sp-12">
          <div className="flex flex-col gap-sp-10 lg:col-span-8">
            <CourseDetailHero course={course} />
            <CourseDetailTabs course={course} />
            <CourseRequirements items={course.requirements} />
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <CourseSidebar course={course} />
            </div>
          </aside>
        </div>

        <div className="mt-sp-16 md:mt-sp-20">
          <SimilarCourses
            currentSlug={course.slug}
            categorySlug={course.category.slug}
          />
        </div>
      </div>

      <CourseStickyBuyBar priceUsdCents={course.priceUsdCents} />
    </>
  );
}
