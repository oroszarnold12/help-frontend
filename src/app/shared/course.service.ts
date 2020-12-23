import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Course } from "../model/course.model";

import { Observable } from "rxjs";
import { CourseCreation } from "../model/course-creation.model";

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

  saveCourse(course: CourseCreation): Observable<Course> {
    return this.http.post<Course>("api/courses", course);
  }
}
