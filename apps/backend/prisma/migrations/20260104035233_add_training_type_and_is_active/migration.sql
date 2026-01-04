-- AlterTable
ALTER TABLE "trainings" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Hipertrofia';
