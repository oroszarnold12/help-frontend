import { ThinPerson } from "./thin.person.model";

export interface AssignmentGradeComment {
  id?: number;
  date?: Date;
  content?: string;
  commenter?: ThinPerson;
}
