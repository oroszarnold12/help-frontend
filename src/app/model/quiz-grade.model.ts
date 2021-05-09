import { Person } from './person.model';
import { Quiz } from './quiz.model';

export class QuizGrade {
  grade?: number;
  submitter?: Person;
  quiz?: Quiz;
}
