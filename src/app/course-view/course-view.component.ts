import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IonSegment, IonSlides } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Course } from "../model/course.model";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";

@Component({
  selector: "app-course-view",
  templateUrl: "./course-view.component.html",
  styleUrls: ["./course-view.component.scss"],
})
export class CourseViewComponent implements OnInit {
  stop: Subject<void> = new Subject();
  course: Course;
  @ViewChild("slides") slides: IonSlides;
  @ViewChild("segments") segments: IonSegment;
  options = {
    initialSlide: 5,
    speed: 400,
  };

  constructor(
    private backButtonService: BackButtonService,
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();
    this.loadCourse();
  }

  ngOnDestroy(): void {
    this.backButtonService.turnOff();
    this.stop.next();
    this.stop.complete();
  }

  loadCourse(): void {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseService
        .getCourse(params.id)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (course) => {
            this.course = course;
          },
          (error) => {
            console.log("error");
          }
        );
    });
  }

  segmentChanged(event) {
    this.slides.slideTo(event.detail.value);
  }

  ionSlideDidChange(): void {
    this.slides.getActiveIndex().then((index) => {
      this.segments.value = index.toString();
    });
  }
}
