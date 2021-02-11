import { ThinPerson } from "./thin.person.model";

export class Submission {
  id?: number;
  submitter?: ThinPerson;
  date?: Date;
  fileName?: string;
  grade?: number;
}
