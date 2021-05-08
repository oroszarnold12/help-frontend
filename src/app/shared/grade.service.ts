import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AssignmentGrade } from '../model/assignment-grade.model';
import { Grades } from '../model/grades.model';
import { QuizGrade } from '../model/quiz-grade.model';
import { url } from './api-config';

@Injectable({
  providedIn: 'root',
})
export class GradeService {
  constructor(private httpClient: HttpClient) {}

  getGradesOfAssignment(
    courseId: number,
    assignmentId: number
  ): Observable<AssignmentGrade[]> {
    return this.httpClient.get<AssignmentGrade[]>(
      `${url}/courses/${courseId}/assignments/${assignmentId}/grades`
    );
  }

  getGradesOfAllAssignments(courseId: number): Observable<Grades> {
    return this.httpClient.get<Grades>(`${url}/courses/${courseId}/grades/`);
  }

  saveGradeOfAssignment(
    courseId: number,
    assignmentId: number,
    grade: number,
    personId: number
  ): Observable<AssignmentGrade> {
    return this.httpClient.post<AssignmentGrade>(
      `${url}/courses/${courseId}/assignments/${assignmentId}/grades`,
      { grade, personId }
    );
  }

  getGradesOfQuiz(courseId: number, quizId: number): Observable<QuizGrade[]> {
    return this.httpClient.get<QuizGrade[]>(
      `${url}/courses/${courseId}/quizzes/${quizId}/grades`
    );
  }
}
