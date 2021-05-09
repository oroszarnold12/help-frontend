import { Assignment } from './assignment.model';
import { Person } from './person.model';

export class AssignmentGrade {
  id?: number;
  grade?: number;
  submitter?: Person;
  assignment?: Assignment;
}
