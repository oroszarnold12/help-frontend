import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SERVER_URL } from 'src/environments/environment';
import { AnnouncementComment } from '../model/announcement-comment.model';
import { AssignmentComment } from '../model/assignment-comment.model';
import { DiscussionComment } from '../model/discussion-comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(private httpClient: HttpClient) {}

  saveAnnouncementComment(
    courseId: number,
    announcementId: number,
    comment: AnnouncementComment
  ): Observable<AnnouncementComment> {
    return this.httpClient.post<AnnouncementComment>(
      `${SERVER_URL}/courses/${courseId}/announcements/${announcementId}/comments`,
      comment
    );
  }

  saveDiscussionComment(
    courseId: number,
    discussionId: number,
    comment: DiscussionComment
  ): Observable<DiscussionComment> {
    return this.httpClient.post<DiscussionComment>(
      `${SERVER_URL}/courses/${courseId}/discussions/${discussionId}/comments`,
      comment
    );
  }

  saveAssingmentComment(
    courseId: number,
    assignmentId: number,
    recipientEmail: string,
    comment: string
  ): Observable<AssignmentComment> {
    return this.httpClient.post<AssignmentComment>(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}/comments`,
      {
        content: comment,
        recipientEmail,
      }
    );
  }

  updateAnnouncementComment(
    courseId: number,
    announcementId: number,
    commentId: number,
    comment: AnnouncementComment
  ): Observable<AnnouncementComment> {
    return this.httpClient.put<AnnouncementComment>(
      `${SERVER_URL}/courses/${courseId}/announcements/${announcementId}/comments/${commentId}`,
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
      `${SERVER_URL}/courses/${courseId}/discussions/${discussionId}/comments/${commentId}`,
      comment
    );
  }

  updateAssignmentComment(
    courseId: number,
    assignmentId: number,
    commentId: number,
    comment: AssignmentComment
  ): Observable<AssignmentComment> {
    return this.httpClient.put<AssignmentComment>(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}/comments/${commentId}`,
      comment
    );
  }

  deleteAnnouncementComment(
    courseId: number,
    announcementId: number,
    commentId: number
  ): Observable<void> {
    return this.httpClient.delete<void>(
      `${SERVER_URL}/courses/${courseId}/announcements/${announcementId}/comments/${commentId}`
    );
  }

  deleteDiscussionComment(
    courseId: number,
    discussionId: number,
    commentId: number
  ): Observable<void> {
    return this.httpClient.delete<void>(
      `${SERVER_URL}/courses/${courseId}/discussions/${discussionId}/comments/${commentId}`
    );
  }

  deleteAssingmentComment(
    courseId: number,
    assignmentId: number,
    commentId: number
  ): Observable<void> {
    return this.httpClient.delete<void>(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}/comments/${commentId}`
    );
  }
}
