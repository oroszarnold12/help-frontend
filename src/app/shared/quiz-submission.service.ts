import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_URL } from 'src/environments/environment';
import { QuizSubmission } from '../model/quiz-submission.model';

@Injectable({
  providedIn: 'root',
})
export class QuizSubmissionService {
  constructor(private http: HttpClient) {}

  getSubmissions(
    courseId: number,
    quizId: number
  ): Observable<QuizSubmission[]> {
    return this.http.get<QuizSubmission[]>(
      `${SERVER_URL}/courses/${courseId}/quizzes/${quizId}/submissions`
    );
  }

  saveQuizSubmission(
    courseId: number,
    quizId: number,
    questionSubmissions: any[]
  ): Observable<QuizSubmission[]> {
    return this.http.post<QuizSubmission[]>(
      `${SERVER_URL}/courses/${courseId}/quizzes/${quizId}/submissions`,
      questionSubmissions
    );
  }
}
