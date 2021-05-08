import { AssignmentFileObject } from './assignment-file-object.model';
import { ThinPerson } from './thin.person.model';

export class Submission {
  id?: number;
  submitter?: ThinPerson;
  date?: Date;
  grade?: number;
  files?: AssignmentFileObject[];
}
