import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { CourseService } from "../shared/course.service";
import { takeUntil } from "rxjs/operators";
import { Course } from "../model/course.model";
import { ModalController } from "@ionic/angular";
import { CourseFormComponent } from "./course-form/course-form.component";
import { AuthService } from "../shared/auth.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  stop: Subject<void> = new Subject();
  courses: Course[];
  teacher: boolean;

  constructor(
    private courseService: CourseService,
    private modalController: ModalController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.teacher = this.authService.isTeacher();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: CourseFormComponent,
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  loadCourses() {
    this.courseService
      .getCourses()
      .pipe(takeUntil(this.stop))
      .subscribe(({ courses }) => {
        this.courses = courses;
      });
  }
}
