import { Answer } from "./answer.model";

export interface Question {
  id?: number;
  content?: string;
  points?: number;
  answers?: Answer[];
}
