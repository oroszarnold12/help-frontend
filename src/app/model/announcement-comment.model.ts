import { Person } from './person.model';

export interface AnnouncementComment {
  id?: number;
  date?: Date;
  content?: string;
  commenter?: Person;
}
