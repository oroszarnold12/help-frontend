import { ThinPerson } from './thin.person.model';

export interface AssignmentComment {
  id?: number;
  date?: Date;
  content?: string;
  commenter?: ThinPerson;
  recipient?: ThinPerson;
}
