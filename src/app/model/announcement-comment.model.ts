import { ThinPerson } from "./thin.person.model";

export interface AnnouncementComment {
  id?: number;
  date?: Date;
  content?: string;
  commenter?: ThinPerson;
}
