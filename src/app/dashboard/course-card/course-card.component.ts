import { Component, Input, OnInit } from "@angular/core";
import { Course } from "../../model/course.model";

@Component({
  selector: "app-course-card",
  templateUrl: "./course-card.component.html",
  styleUrls: ["./course-card.component.scss"],
})
export class CourseCardComponent implements OnInit {
  @Input() course: Course;

  constructor() {}

  ngOnInit() {}
}
