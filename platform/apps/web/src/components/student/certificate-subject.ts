import { CredentialDto } from '@dojo-hub/shared';

/**
 * What the certificate says it is for. A course certificate names the course; a ladder
 * credential keeps its original "<Level> Level" wording, so certificates issued before
 * course certificates existed still read exactly as they were awarded.
 */
export function subjectLine(credential: CredentialDto): string {
  return credential.track ? credential.subjectTitle : `${credential.subjectTitle} Level`;
}
