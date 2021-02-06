import { Person } from "./person.model";

export interface Discussion {
  id?: number;
  name?: string;
  content?: string;
  date?: string;
  comments?: string[];
  creator?: Person;
}
