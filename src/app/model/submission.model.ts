import { AssignmentFileObject } from './assignment-file-object.model';
import { Person } from './person.model';

export class Submission {
  id?: number;
  submitter?: Person;
  date?: Date;
  grade?: number;
  files?: AssignmentFileObject[];
}
