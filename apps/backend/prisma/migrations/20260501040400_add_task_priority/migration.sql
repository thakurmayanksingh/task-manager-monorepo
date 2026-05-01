-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('Low', 'Medium', 'High');

-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'Medium';
