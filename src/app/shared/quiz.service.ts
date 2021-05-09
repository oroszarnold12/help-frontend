import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_URL } from 'src/environments/environment';
import { Quiz } from '../model/quiz.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  constructor(private http: HttpClient) {}

  getQuiz(courseId: number, quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(
      `${SERVER_URL}/courses/${courseId}/quizzes/${quizId}`
    );
  }

  saveQuiz(quiz: Quiz, courseId: number): Observable<Quiz> {
    return this.http.post<Quiz>(
      `${SERVER_URL}/courses/${courseId}/quizzes`,
      quiz
    );
  }

  updateQuiz(quiz: Quiz, courseId: number, quizId: number): Observable<Quiz> {
    return this.http.put<Quiz>(
      `${SERVER_URL}/courses/${courseId}/quizzes/${quizId}`,
      quiz
    );
  }

  deleteQuiz(courseId: number, quizId: number): Observable<void> {
    return this.http.delete<void>(
      `${SERVER_URL}/courses/${courseId}/quizzes/${quizId}`
    );
  }
}
