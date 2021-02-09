import { DiscussionComment } from "./discussion-comment.model";
import { Person } from "./person.model";

export interface Discussion {
  id?: number;
  name?: string;
  content?: string;
  date?: string;
  creator?: Person;
  comments?: DiscussionComment[];
}
