-- Email verification + notification preference.
--
-- Every existing account is backfilled as already verified. Login is refused while
-- emailVerifiedAt is null, so without this backfill everyone currently using the
-- platform would be locked out the moment this ships.

ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN "verificationSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- Grandfather existing accounts.
UPDATE "User" SET "emailVerifiedAt" = CURRENT_TIMESTAMP WHERE "emailVerifiedAt" IS NULL;
