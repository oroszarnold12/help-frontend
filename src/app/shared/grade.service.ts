import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Grade } from "../model/grade.model";
import { url } from "./api-config";

@Injectable({
  providedIn: "root",
})
export class GradeService {
  constructor(private httpClient: HttpClient) {}

  getGrades(courseId: number, assignmentId: number): Observable<Grade[]> {
    return this.httpClient.get<Grade[]>(
      `${url}/courses/${courseId}/assignments/${assignmentId}/grades`
    );
  }

  getGradesOfAllAssignments(courseId: number): Observable<Grade[]> {
    return this.httpClient.get<Grade[]>(`${url}/courses/${courseId}/grades/`);
  }

  saveGrade(
    courseId: number,
    assignmentId: number,
    grade: number,
    personId: number
  ): Observable<Grade> {
    return this.httpClient.post<Grade>(
      `${url}/courses/${courseId}/assignments/${assignmentId}/grades`,
      { grade: grade, personId: personId }
    );
  }
}
