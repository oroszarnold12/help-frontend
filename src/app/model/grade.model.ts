import { Assignment } from "./assignment.model";
import { ThinPerson } from "./thin.person.model";

export class Grade {
  grade?: number;
  submitter?: ThinPerson;
  assignment?: Assignment;
}
