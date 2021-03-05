import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Quiz } from "../model/quiz.model";
import { url } from "./api-config";

@Injectable({
  providedIn: "root",
})
export class QuizService {
  constructor(private http: HttpClient) {}

  getQuiz(courseId: number, quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${url}/courses/${courseId}/quizzes/${quizId}`);
  }

  saveQuiz(quiz: Quiz, courseId: number): Observable<Quiz> {
    return this.http.post<Quiz>(`${url}/courses/${courseId}/quizzes`, quiz);
  }

  updateQuiz(quiz: Quiz, courseId: number, quizId: number): Observable<Quiz> {
    return this.http.put<Quiz>(
      `${url}/courses/${courseId}/quizzes/${quizId}`,
      quiz
    );
  }

  deleteQuiz(courseId: number, quizId: number): Observable<void> {
    return this.http.delete<void>(
      `${url}/courses/${courseId}/quizzes/${quizId}`
    );
  }
}
