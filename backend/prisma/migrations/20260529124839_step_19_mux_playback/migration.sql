-- CreateEnum
CREATE TYPE "MuxPlaybackPolicy" AS ENUM ('PUBLIC', 'SIGNED');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "muxPlaybackId" TEXT,
ADD COLUMN     "muxPlaybackPolicy" "MuxPlaybackPolicy" NOT NULL DEFAULT 'PUBLIC';
