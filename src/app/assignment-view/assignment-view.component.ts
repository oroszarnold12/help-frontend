import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AssignmentFormComponent } from "../course-view/assignment-form/assignment-form.component";
import { Assignment } from "../model/assignment.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";
import { ToasterService } from "../shared/toaster.service";

@Component({
  selector: "app-assignment-view",
  templateUrl: "./assignment-view.component.html",
  styleUrls: ["./assignment-view.component.scss"],
})
export class AssignmentViewComponent implements OnInit {
  assignment: Assignment;
  stop: Subject<void> = new Subject();
  isTeacher: boolean;
  courseId: number;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private backButtonService: BackButtonService,
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();

    this.isTeacher = this.authService.isTeacher();

    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseId = params.courseId;
      this.courseService
        .getAssignment(params.courseId, params.assignmentId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (assignemnt) => {
            this.assignment = assignemnt;
          },
          (error) => {
            this.toasterService.error(
              "Could not get assignment!",
              "Something went wrong!"
            );
          }
        );
    });
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  async presentAssignmentModal() {
    const modal = await this.modalController.create({
      component: AssignmentFormComponent,
      componentProps: {
        courseId: this.courseId,
        assignment: this.assignment,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }
}
