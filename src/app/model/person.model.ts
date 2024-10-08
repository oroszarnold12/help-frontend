import { Role } from './role.enum';

export interface Person {
  id?: number;
  firstName?: string;
  lastName?: string;
  personGroup?: string;
  email?: string;
  sendNotifications?: boolean;
  role?: Role;
}
