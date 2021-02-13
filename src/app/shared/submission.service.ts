import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Submission } from "../model/submission.model";

@Injectable({
  providedIn: "root",
})
export class SubmissionService {
  constructor(private httpClient: HttpClient) {}

  getSubmission(courseId: number, assignmentId: number, submissionId: number) {
    return this.httpClient.get(
      `api/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`,
      { responseType: "blob" }
    );
  }

  getSubmissions(
    courseId: number,
    assignmentId: number
  ): Observable<Submission[]> {
    return this.httpClient.get<Submission[]>(
      `api/courses/${courseId}/assignments/${assignmentId}/submissions`
    );
  }

  saveSubmission(
    courseId: number,
    assignmentId: number,
    data: FormData
  ): Observable<Submission> {
    return this.httpClient.post<Submission>(
      `api/courses/${courseId}/assignments/${assignmentId}/submissions`,
      data
    );
  }
}
