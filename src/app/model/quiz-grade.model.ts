import { Quiz } from './quiz.model';
import { ThinPerson } from './thin.person.model';

export class QuizGrade {
  grade?: number;
  submitter?: ThinPerson;
  quiz?: Quiz;
}
