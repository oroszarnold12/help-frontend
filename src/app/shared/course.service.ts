import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Course } from '../model/course.model';

import { Observable } from 'rxjs';
import { CourseCreation } from '../model/course-creation.model';
import { Announcement } from '../model/announcement.model';
import { Assignment } from '../model/assignment.model';
import { Discussion } from '../model/discussion.model';
import { ThinPerson } from '../model/thin.person.model';
import { CourseFile } from '../model/course-file.model';
import { SERVER_URL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private http: HttpClient) {}

  getCourses(): Observable<{ courses: Course[] }> {
    return this.http.get<{ courses: Course[] }>(`${SERVER_URL}/courses`);
  }

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${SERVER_URL}/courses/${id}`);
  }

  getAnnouncement(
    courseId: number,
    announcementId: number
  ): Observable<Announcement> {
    return this.http.get<Announcement>(
      `${SERVER_URL}/courses/${courseId}/announcements/${announcementId}`
    );
  }

  getAssignment(
    courseId: number,
    assignmentId: number
  ): Observable<Assignment> {
    return this.http.get<Assignment>(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}`
    );
  }

  getParticipants(courseId: number): Observable<ThinPerson[]> {
    return this.http.get<ThinPerson[]>(
      `${SERVER_URL}/courses/${courseId}/participants`
    );
  }

  getDiscussion(
    courseId: number,
    discussionId: number
  ): Observable<Discussion> {
    return this.http.get<Discussion>(
      `${SERVER_URL}/courses/${courseId}/discussions/${discussionId}`
    );
  }

  getCourseFile(courseId: number, fileId: number): Observable<Blob> {
    return this.http.get(`${SERVER_URL}/courses/${courseId}/files/${fileId}`, {
      responseType: 'blob',
    });
  }

  getAllCourseFiles(courseId: number): Observable<Blob> {
    return this.http.get(`${SERVER_URL}/courses/${courseId}/files`, {
      responseType: 'blob',
    });
  }

  getSomeCourseFiles(
    courseId: number,
    courseFilesIds: string[]
  ): Observable<Blob> {
    const headers = new HttpHeaders().set('courseFilesIds', courseFilesIds);

    return this.http.get(`${SERVER_URL}/courses/${courseId}/files`, {
      responseType: 'blob',
      headers,
    });
  }

  saveCourse(course: CourseCreation): Observable<Course> {
    return this.http.post<Course>(`${SERVER_URL}/courses`, course);
  }

  saveAnnouncement(
    announcement: Announcement,
    courseId: number
  ): Observable<Announcement> {
    return this.http.post<Announcement>(
      `${SERVER_URL}/courses/${courseId}/announcements`,
      announcement
    );
  }

  saveAssignment(
    assignment: Assignment,
    courseId: number
  ): Observable<Assignment> {
    return this.http.post<Assignment>(
      `${SERVER_URL}/courses/${courseId}/assignments`,
      assignment
    );
  }

  saveDiscussion(
    discussion: Discussion,
    courseId: number
  ): Observable<Discussion> {
    return this.http.post<Discussion>(
      `${SERVER_URL}/courses/${courseId}/discussions`,
      discussion
    );
  }

  saveCourseFile(courseId: number, data: FormData): Observable<CourseFile[]> {
    return this.http.post<CourseFile[]>(
      `${SERVER_URL}/courses/${courseId}/files`,
      data
    );
  }

  updateCourse(course: CourseCreation, id: number): Observable<Course> {
    return this.http.put<Course>(`${SERVER_URL}/courses/${id}`, course);
  }

  updateAnnouncement(
    announcement: Announcement,
    courseId: number,
    announcementId: number
  ): Observable<Announcement> {
    return this.http.put<Announcement>(
      `${SERVER_URL}/courses/${courseId}/announcements/${announcementId}`,
      announcement
    );
  }

  updateAssignment(
    assignment: Assignment,
    courseId: number,
    assignmentId: number
  ): Observable<Assignment> {
    return this.http.put<Assignment>(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}`,
      assignment
    );
  }

  updateDiscussion(
    discussion: Discussion,
    courseId: number,
    discussionId: number
  ): Observable<Discussion> {
    return this.http.put<Discussion>(
      `${SERVER_URL}/courses/${courseId}/discussions/${discussionId}`,
      discussion
    );
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${SERVER_URL}/courses/${id}`);
  }

  deleteAnnouncement(
    courseId: number,
    announcementId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${SERVER_URL}/courses/${courseId}/announcements/${announcementId}`
    );
  }

  deleteAssignment(courseId: number, assignmentId: number): Observable<void> {
    return this.http.delete<void>(
      `${SERVER_URL}/courses/${courseId}/assignments/${assignmentId}`
    );
  }

  deleteDiscussions(courseId: number, discussionId: number): Observable<void> {
    return this.http.delete<void>(
      `${SERVER_URL}/courses/${courseId}/discussions/${discussionId}`
    );
  }

  deleteCourseFile(courseId: number, fileId: number): Observable<void> {
    return this.http.delete<void>(
      `${SERVER_URL}/courses/${courseId}/files/${fileId}`
    );
  }

  deleteParticipant(courseId: number, participantId: number): Observable<void> {
    return this.http.delete<void>(
      `${SERVER_URL}/courses/${courseId}/participants/${participantId}`
    );
  }
}
