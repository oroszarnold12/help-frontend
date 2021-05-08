import { Role } from './role.enum';

export interface Person {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
}
