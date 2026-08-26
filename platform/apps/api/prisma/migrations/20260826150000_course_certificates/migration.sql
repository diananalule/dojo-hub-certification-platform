-- Certificates are earned by completing a course, not by an approved capstone against
-- the level ladder. A credential now points at a Track; the old levelId becomes optional
-- so credentials already issued against a level keep verifying exactly as before.
ALTER TABLE "Credential" ALTER COLUMN "levelId" DROP NOT NULL;

ALTER TABLE "Credential" ADD COLUMN "trackId" TEXT;

ALTER TABLE "Credential"
  ADD CONSTRAINT "Credential_trackId_fkey"
  FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Credential_trackId_idx" ON "Credential"("trackId");
