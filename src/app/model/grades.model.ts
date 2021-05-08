import { AssignmentGrade } from './assignment-grade.model';
import { QuizGrade } from './quiz-grade.model';

export interface Grades {
  assignmentGrades: AssignmentGrade[];
  quizGrades: QuizGrade[];
}
