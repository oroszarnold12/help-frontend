import { AssignmentComment } from "./assignment-comment.model";

export interface Assignment {
  id?: number;
  name?: string;
  dueDate?: Date;
  points?: number;
  description?: string;
  published?: boolean;
  comments?: AssignmentComment[];
}
