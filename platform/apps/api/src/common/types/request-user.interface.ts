import { UserRole } from '@dojo-hub/shared';

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
