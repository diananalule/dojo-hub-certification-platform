-- Self-service password reset. Until now the only recovery path was an administrator
-- setting a password by hand, which does not scale and means the admin knows the
-- password they are handing over.
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");
