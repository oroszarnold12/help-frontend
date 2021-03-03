import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AnnouncementComment } from "../model/announcement-comment.model";
import { DiscussionComment } from "../model/discussion-comment.model";
import { url } from "./api-config";

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
      `${url}/courses/${courseId}/announcements/${announcementId}/comments`,
      comment
    );
  }

  saveDiscussionComment(
    courseId: number,
    discussionId: number,
    comment: DiscussionComment
  ): Observable<DiscussionComment> {
    return this.httpClient.post<DiscussionComment>(
      `${url}/courses/${courseId}/discussions/${discussionId}/comments`,
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
      `${url}/courses/${courseId}/announcements/${announcementId}/comments/${commentId}`,
      comment
    );
  }

  updateDiscussionComment(
    courseId: number,
    discussionId: number,
    commentId: number,
    comment: DiscussionComment
  ): Observable<DiscussionComment> {
    return this.httpClient.put<DiscussionComment>(
      `${url}/courses/${courseId}/discussions/${discussionId}/comments/${commentId}`,
      comment
    );
  }

  deleteAnnouncementComment(
    courseId: number,
    announcementId: number,
    commentId: number
  ): Observable<void> {
    return this.httpClient.delete<void>(
      `${url}/courses/${courseId}/announcements/${announcementId}/comments/${commentId}`
    );
  }

  deleteDiscussionComment(
    courseId: number,
    discussionId: number,
    commentId: number
  ): Observable<void> {
    return this.httpClient.delete<void>(
      `${url}/courses/${courseId}/discussions/${discussionId}/comments/${commentId}`
    );
  }
}
