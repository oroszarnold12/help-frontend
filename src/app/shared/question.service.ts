import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_URL } from 'src/environments/environment';
import { Question } from '../model/question.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  constructor(private http: HttpClient) {}

  getQuestions(courseId: number, quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(
      `${SERVER_URL}/courses/${courseId}/quizzes/${quizId}/questions`
    );
  }

  saveQuestion(
    courseId: number,
    quizId: number,
    question: Question
  ): Observable<Question> {
    return this.http.post<Question>(
      `${SERVER_URL}/courses/${courseId}/quizzes/${quizId}/questions`,
      question
    );
  }

  updateQuestion(
    courseId: number,
    quizId: number,
    questionId: number,
    question: Question
  ): Observable<Question> {
    return this.http.put<Question>(
      `${SERVER_URL}/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`,
      question
    );
  }

  deleteQuestion(
    courseId: number,
    quizId: number,
    questionId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${SERVER_URL}/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`
    );
  }
}
