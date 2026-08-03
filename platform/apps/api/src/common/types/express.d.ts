import { RequestUser } from './request-user.interface';

// @types/passport declares `Express.User` (empty by default) and `Request.user?: User`.
// Augmenting `Express.User` itself (rather than redeclaring `Request.user`) merges cleanly
// with Passport's own ambient types instead of conflicting with them.
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- canonical Passport typing pattern
    interface User extends RequestUser {}
  }
}

export {};
