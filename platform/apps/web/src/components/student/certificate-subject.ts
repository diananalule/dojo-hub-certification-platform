import { CredentialDto } from '@dojo-hub/shared';

/**
 * What the certificate says it is for. A course certificate names the course; a ladder
 * credential keeps its original "<Level> Level" wording, so certificates issued before
 * course certificates existed still read exactly as they were awarded.
 */
export function subjectLine(credential: CredentialDto): string {
  return credential.track ? credential.subjectTitle : `${credential.subjectTitle} Level`;
}

/**
 * The course's level, shown under the recipient's name. Replaces the student's email
 * address, which had no business being printed on a document meant to be shared.
 * Ladder credentials have no course, so they show nothing here.
 */
export function levelLine(credential: CredentialDto): string | null {
  if (!credential.track) return null;
  const d = credential.track.difficulty;
  return `${d.charAt(0)}${d.slice(1).toLowerCase()} Level`;
}
