-- Clean up any legacy bonus-points notifications before the enum value is dropped
DELETE FROM "Notification" WHERE "type" = 'BONUS_POINTS_GRANTED';

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('SUBMISSION_GRADED', 'CREDENTIAL_ISSUED', 'LEVEL_UP', 'OFFICE_HOUR_BOOKED', 'OFFICE_HOUR_CANCELLED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_REACTIVATED');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "PointsTransaction" DROP CONSTRAINT "PointsTransaction_createdById_fkey";

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "requiredPoints";

-- AlterTable
ALTER TABLE "ModuleQuiz" DROP COLUMN "pointsReward";

-- AlterTable
ALTER TABLE "QuizAttempt" DROP COLUMN "pointsAwarded";

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "points";

-- AlterTable
ALTER TABLE "TrackAssessment" DROP COLUMN "pointsReward";

-- DropTable
DROP TABLE "PointsTransaction";

-- DropEnum
DROP TYPE "PointsSourceType";

