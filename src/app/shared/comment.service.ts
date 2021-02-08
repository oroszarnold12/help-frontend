import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AnnouncementComment } from "../model/announcement-comment.model";

@Injectable({
  providedIn: "root",
})
export class CommentService {
  constructor(private httpClient: HttpClient) {}

  saveAnnouncementComment(
    courseId: number,
    announcementId: number,
    comment: AnnouncementComment
  ): Observable<AnnouncementComment> {
    return this.httpClient.post<AnnouncementComment>(
      `api/courses/${courseId}/announcements/${announcementId}/comments`,
      comment
    );
  }

  updateAnnouncementComment(
    courseId: number,
    announcementId: number,
    commentId: number,
    comment: AnnouncementComment
  ): Observable<AnnouncementComment> {
    return this.httpClient.put<AnnouncementComment>(
      `api/courses/${courseId}/announcements/${announcementId}/comments/${commentId}`,
      comment
    );
  }

  deleteAnnouncementComment(
    courseId: number,
    announcementId: number,
    commentId: number
  ): Observable<void> {
    return this.httpClient.delete<void>(
      `api/courses/${courseId}/announcements/${announcementId}/comments/${commentId}`
    );
  }
}
