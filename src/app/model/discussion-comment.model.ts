import { Person } from './person.model';

export interface DiscussionComment {
  id?: number;
  date?: Date;
  content?: string;
  commenter?: Person;
}
