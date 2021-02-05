import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Course } from "../model/course.model";

import { Observable } from "rxjs";
import { CourseCreation } from "../model/course-creation.model";
import { Announcement } from "../model/announcement.model";

@Injectable({
  providedIn: "root",
})
export class CourseService {
  constructor(private http: HttpClient) {}

  getCourses(): Observable<{ courses: Course[] }> {
    return this.http.get<{ courses: Course[] }>(`api/courses`);
  }

  getCourse(id: number): Observable<Course> {
    return this.http.get<Course>(`api/courses/${id}`);
  }

  getAnnouncement(
    courseId: number,
    announcementId: number
  ): Observable<Announcement> {
    return this.http.get<Announcement>(
      `api/courses/${courseId}/announcements/${announcementId}`
    );
  }

  saveCourse(course: CourseCreation): Observable<Course> {
    return this.http.post<Course>("api/courses", course);
  }

  saveAnnouncement(
    announcement: Announcement,
    courseId: number
  ): Observable<Announcement> {
    return this.http.post<Announcement>(
      `api/courses/${courseId}/announcements`,
      announcement
    );
  }

  updateCourse(course: Course, id: number): Observable<Course> {
    return this.http.put<Course>(`api/courses/${id}`, course);
  }

  updateAnnouncement(
    announcement: Announcement,
    courseId: number,
    announcementId: number
  ): Observable<Announcement> {
    return this.http.put<Announcement>(
      `api/courses/${courseId}/announcements/${announcementId}`,
      announcement
    );
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`api/courses/${id}`);
  }

  deleteAnnouncement(
    courseId: number,
    announcementId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `api/courses/${courseId}/announcements/${announcementId}`
    );
  }
}
