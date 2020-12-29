import { Annoucement } from "./announcement.model";
import { Assignment } from "./assignment.model";
import { Discussion } from "./discussion.model";
import { Person } from "./person.model";

export interface Course {
  id?: number;
  name?: string;
  longName?: string;
  description?: string;
  assignments?: Assignment[];
  announcements?: Annoucement[];
  discussions?: Discussion[];
  teacher: Person;
}
