-- CreateEnum
CREATE TYPE "MuxAssetStatus" AS ENUM ('NONE', 'UPLOADING', 'PROCESSING', 'READY', 'ERRORED');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "muxAssetStatus" "MuxAssetStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "muxUploadId" TEXT;
