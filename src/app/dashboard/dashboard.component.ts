import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { CourseService } from "../shared/course.service";
import { takeUntil } from "rxjs/operators";
import { Course } from "../model/course.model";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  stop: Subject<void> = new Subject();
  courses: Course[];

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.courseService
      .getCourses()
      .pipe(takeUntil(this.stop))
      .subscribe(({ courses }) => {
        this.courses = courses;
      });
  }
}
