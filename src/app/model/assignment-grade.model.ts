import { AssignmentGradeComment } from "./assignment-grade-comment.model";
import { Assignment } from "./assignment.model";
import { ThinPerson } from "./thin.person.model";

export class AssignmentGrade {
  id?: number;
  grade?: number;
  submitter?: ThinPerson;
  assignment?: Assignment;
  comments?: AssignmentGradeComment[];
}
