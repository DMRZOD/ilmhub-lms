-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "votesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "answersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "hasInstructorAnswer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Question_courseId_lastActivityAt_idx" ON "Question"("courseId", "lastActivityAt");
