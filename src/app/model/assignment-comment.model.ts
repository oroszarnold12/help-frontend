import { Person } from './person.model';

export interface AssignmentComment {
  id?: number;
  date?: Date;
  content?: string;
  commenter?: Person;
  recipient?: Person;
}
