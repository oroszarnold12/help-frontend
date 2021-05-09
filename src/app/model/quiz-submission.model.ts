import { AnswerSubmission } from './answer-submission.model';
import { Person } from './person.model';

export interface QuizSubmission {
  submitter?: Person;
  answerSubmissions?: AnswerSubmission[];
}
