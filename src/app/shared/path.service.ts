import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Course } from '../model/course.model';
import { CourseService } from './course.service';

@Injectable({
  providedIn: 'root',
})
export class PathService {
  private path = new BehaviorSubject<string>('');
  private course: Course;

  path$ = this.path.asObservable();

  constructor(private router: Router, private courseService: CourseService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.convertUrlToPath(event.url);
      }
    });
  }

  convertUrlToPath(url: string): void {
    switch (true) {
      case '/chat' === url: {
        this.path.next('Chat');
        break;
      }
      case '/dashboard' === url: {
        this.path.next('Dashboard');
        break;
      }
      case '/participations' === url: {
        this.path.next('Courses');
        break;
      }
      case '/user' === url: {
        this.path.next('Account Settings');
        break;
      }
      case '/admin' === url: {
        this.path.next('Admin');
        break;
      }
      case /^\/courses\/[0-9]+$/.test(url): {
        this.loadCourse(
          Number(url.replace(/\/courses\//g, '')),
          this.setCurrentCourseName
        );
        break;
      }
      case /^\/courses\/[0-9]+\/assignments/.test(url): {
        this.loadCourse(
          Number(
            url.replace(/\/courses\//g, '').replace(/\/assignments.*/g, '')
          ),
          this.setCurrentCourseNameWithAssignments
        );
        break;
      }
      case /^\/courses\/[0-9]+\/announcements/.test(url): {
        this.loadCourse(
          Number(
            url.replace(/\/courses\//g, '').replace(/\/announcements.*/g, '')
          ),
          this.setCurrentCourseNameWithAnnouncements
        );
        break;
      }
      case /^\/courses\/[0-9]+\/quizzes/.test(url): {
        this.loadCourse(
          Number(url.replace(/\/courses\//g, '').replace(/\/quizzes.*/g, '')),
          this.setCurrentCourseNameWithQuizzes
        );
        break;
      }
      case /^\/courses\/[0-9]+\/discussions/.test(url): {
        this.loadCourse(
          Number(
            url.replace(/\/courses\//g, '').replace(/\/discussions.*/g, '')
          ),
          this.setCurrentCourseNameWithDiscussions
        );
        break;
      }
    }
  }

  loadCourse(
    courseId: number,
    callback: (course: Course, path: BehaviorSubject<string>) => void
  ): void {
    if (!!this.course && courseId === this.course.id) {
      callback(this.course, this.path);
    } else {
      this.courseService.getCourse(courseId).subscribe(
        (course) => {
          this.course = course;
          callback(course, this.path);
        },
        () => {}
      );
    }
  }

  setCurrentCourseName(course: Course, path: BehaviorSubject<string>): void {
    path.next(course.name);
  }

  setCurrentCourseNameWithAssignments(
    course: Course,
    path: BehaviorSubject<string>
  ): void {
    path.next(course.name + '/Assignments');
  }

  setCurrentCourseNameWithAnnouncements(
    course: Course,
    path: BehaviorSubject<string>
  ): void {
    path.next(course.name + '/Announcements');
  }

  setCurrentCourseNameWithQuizzes(
    course: Course,
    path: BehaviorSubject<string>
  ): void {
    path.next(course.name + '/Quizzes');
  }

  setCurrentCourseNameWithDiscussions(
    course: Course,
    path: BehaviorSubject<string>
  ): void {
    path.next(course.name + '/Discussions');
  }
}
