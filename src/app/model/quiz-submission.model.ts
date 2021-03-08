import { AnswerSubmission } from "./answer-submission.model";
import { ThinPerson } from "./thin.person.model";

export interface QuizSubmission {
  submitter?: ThinPerson;
  answers?: AnswerSubmission[];
}
