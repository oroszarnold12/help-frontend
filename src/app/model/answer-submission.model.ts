import { Answer } from './answer.model';

export interface AnswerSubmission {
  answer?: Answer;
  picked?: boolean;
}
