import { Annoucement } from "./announcement.model";
import { Assignment } from "./assignment.model";
import { Discussion } from "./discussion.model";

export interface Course {
  id?: number;
  name?: string;
  longName?: string;
  description?: string;
  assignments?: Assignment[];
  announcements?: Annoucement[];
  discussions?: Discussion[];
}
