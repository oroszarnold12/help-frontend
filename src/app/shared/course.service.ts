import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Course } from "../model/course.model";

import { Observable } from "rxjs";
import { CourseCreation } from "../model/course-creation.model";
import { Announcement } from "../model/announcement.model";
import { Assignment } from "../model/assignment.model";
import { Discussion } from "../model/discussion.model";
import { url } from "./api-config";
import { ThinPerson } from "../model/thin.person.model";

@Injectable({
  providedIn: "root",
})
export class CourseService {
  constructor(private http: HttpClient) {}

  getCourses(): Observable<{ courses: Course[] }> {
    return this.http.get<{ courses: Course[] }>(`${url}/courses`);
  }

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`${url}/courses/${id}`);
  }

  getAnnouncement(
    courseId: number,
    announcementId: number
  ): Observable<Announcement> {
    return this.http.get<Announcement>(
      `${url}/courses/${courseId}/announcements/${announcementId}`
    );
  }

  getAssignment(
    courseId: number,
    assignmentId: number
  ): Observable<Assignment> {
    return this.http.get<Assignment>(
      `${url}/courses/${courseId}/assignments/${assignmentId}`
    );
  }

  getParticipants(
    courseId: number,
  ): Observable<ThinPerson[]> {
    return this.http.get<ThinPerson[]>(
      `${url}/courses/${courseId}/participants`
    );
  }

  getDiscussion(
    courseId: number,
    discussionId: number
  ): Observable<Discussion> {
    return this.http.get<Discussion>(
      `${url}/courses/${courseId}/discussions/${discussionId}`
    );
  }

  saveCourse(course: CourseCreation): Observable<Course> {
    return this.http.post<Course>(`${url}/courses`, course);
  }

  saveAnnouncement(
    announcement: Announcement,
    courseId: number
  ): Observable<Announcement> {
    return this.http.post<Announcement>(
      `${url}/courses/${courseId}/announcements`,
      announcement
    );
  }

  saveAssignment(
    assignment: Assignment,
    courseId: number
  ): Observable<Assignment> {
    return this.http.post<Assignment>(
      `${url}/courses/${courseId}/assignments`,
      assignment
    );
  }

  saveDiscussion(
    discussion: Discussion,
    courseId: number
  ): Observable<Discussion> {
    return this.http.post<Discussion>(
      `${url}/courses/${courseId}/discussions`,
      discussion
    );
  }

  updateCourse(course: CourseCreation, id: number): Observable<Course> {
    return this.http.put<Course>(`${url}/courses/${id}`, course);
  }

  updateAnnouncement(
    announcement: Announcement,
    courseId: number,
    announcementId: number
  ): Observable<Announcement> {
    return this.http.put<Announcement>(
      `${url}/courses/${courseId}/announcements/${announcementId}`,
      announcement
    );
  }

  updateAssignment(
    assignment: Assignment,
    courseId: number,
    assignmentId: number
  ): Observable<Assignment> {
    return this.http.put<Assignment>(
      `${url}/courses/${courseId}/assignments/${assignmentId}`,
      assignment
    );
  }

  updateDiscussion(
    discussion: Discussion,
    courseId: number,
    discussionId: number
  ): Observable<Discussion> {
    return this.http.put<Discussion>(
      `${url}/courses/${courseId}/discussions/${discussionId}`,
      discussion
    );
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${url}/courses/${id}`);
  }

  deleteAnnouncement(
    courseId: number,
    announcementId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${url}/courses/${courseId}/announcements/${announcementId}`
    );
  }

  deleteAssignment(courseId: number, assignmentId: number): Observable<void> {
    return this.http.delete<void>(
      `${url}/courses/${courseId}/assignments/${assignmentId}`
    );
  }

  deleteDiscussions(courseId: number, discussionId: number): Observable<void> {
    return this.http.delete<void>(
      `${url}/courses/${courseId}/discussions/${discussionId}`
    );
  }
}
