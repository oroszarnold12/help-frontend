import { ThinPerson } from './thin.person.model';

export interface DiscussionComment {
  id?: number;
  date?: Date;
  content?: string;
  commenter?: ThinPerson;
}
