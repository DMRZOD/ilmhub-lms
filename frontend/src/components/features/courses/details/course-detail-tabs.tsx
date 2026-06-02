"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QaPanel } from "@/components/features/qa/qa-panel";
import type { CourseDetail } from "@/types/api";

import { CourseCurriculum } from "./course-curriculum";
import { CourseInstructorPanel } from "./course-instructor-panel";
import { CourseNotes } from "./course-notes";
import { CourseChecklist } from "./course-requirements";
import { CourseReviews } from "./course-reviews";

export function CourseDetailTabs({ course }: { course: CourseDetail }) {
  const description = course.longDescription ?? course.description ?? "";

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList>
        <TabsTrigger value="description">Tavsif</TabsTrigger>
        <TabsTrigger value="outcomes">O&apos;rganasiz</TabsTrigger>
        <TabsTrigger value="curriculum">Dasturi</TabsTrigger>
        <TabsTrigger value="instructor">Ustoz</TabsTrigger>
        <TabsTrigger value="reviews">Sharhlar</TabsTrigger>
        {course.isEnrolled && (
          <TabsTrigger value="qa">Savollar</TabsTrigger>
        )}
        {course.isEnrolled && (
          <TabsTrigger value="notes">Eslatmalarim</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="description">
        <div className="max-w-3xl whitespace-pre-line text-t-14 leading-relaxed text-fg-2 md:text-t-16">
          {description}
        </div>
      </TabsContent>

      <TabsContent value="outcomes">
        <h2 className="mb-sp-4 text-t-24 font-bold text-ilm-ink">
          Ushbu kursda nimani o&apos;rganasiz
        </h2>
        <CourseChecklist items={course.learningOutcomes} columns={2} />
      </TabsContent>

      <TabsContent value="curriculum">
        <CourseCurriculum
          sections={course.sections}
          totalLessons={course.lessonsCount}
          totalMinutes={course.durationMinutes}
        />
      </TabsContent>

      <TabsContent value="instructor">
        <CourseInstructorPanel instructor={course.instructor} />
      </TabsContent>

      <TabsContent value="reviews">
        <CourseReviews
          slug={course.slug}
          courseTitle={course.title}
          rating={course.ratingAvg}
          ratingCount={course.ratingCount}
          isEnrolled={Boolean(course.isEnrolled)}
        />
      </TabsContent>

      {course.isEnrolled && (
        <TabsContent value="qa">
          <QaPanel
            courseId={course.id}
            enrolled={Boolean(course.isEnrolled)}
            courseInstructorId={course.instructor.id}
          />
        </TabsContent>
      )}

      {course.isEnrolled && (
        <TabsContent value="notes">
          <CourseNotes courseId={course.id} courseTitle={course.title} />
        </TabsContent>
      )}
    </Tabs>
  );
}
