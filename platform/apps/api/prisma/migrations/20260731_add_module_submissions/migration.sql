-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "moduleId" TEXT;

-- CreateIndex
CREATE INDEX "Submission_moduleId_idx" ON "Submission"("moduleId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

