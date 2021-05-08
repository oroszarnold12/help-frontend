import { ThinPerson } from './thin.person.model';

export class CourseFile {
  id?: number;
  size?: number;
  fileName?: string;
  creationDate?: Date;
  uploader?: ThinPerson;
}
