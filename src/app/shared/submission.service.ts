import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_URL } from 'src/environments/environment';
import { Submission } from '../model/submission.model';

@Injectable({
  providedIn: 'root',
})
export class SubmissionService {
  constructor(private httpClient: HttpClient) {}

  getFilesOfAssignment(
    courseId: number,
    assignmentId: number
  ): Observable<Blob> {
    return this.httpClient.get(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}/submissions/files`,
      { responseType: 'blob' }
    );
  }

  getSubmissionFile(
    courseId: number,
    assignmentId: number,
    submissionId: number,
    fileId: number
  ): Observable<Blob> {
    return this.httpClient.get(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/files/${fileId}`,
      { responseType: 'blob' }
    );
  }

  getSubmissions(
    courseId: number,
    assignmentId: number
  ): Observable<Submission[]> {
    return this.httpClient.get<Submission[]>(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}/submissions`
    );
  }

  saveSubmission(
    courseId: number,
    assignmentId: number,
    data: FormData
  ): Observable<Submission> {
    return this.httpClient.post<Submission>(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}/submissions`,
      data
    );
  }
}
