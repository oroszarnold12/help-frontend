import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { FileSaverService } from "ngx-filesaver";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AssignmentFormComponent } from "../course-view/assignment-form/assignment-form.component";
import { Assignment } from "../model/assignment.model";
import { Grade } from "../model/grade.model";
import { Submission } from "../model/submission.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";
import { GradeService } from "../shared/grade.service";
import { SubmissionService } from "../shared/submission.service";
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
  isSubmitting: boolean;
  submissions: Submission[];
  grade: Grade;

  private file;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private backButtonService: BackButtonService,
    private authService: AuthService,
    private modalController: ModalController,
    private submissionService: SubmissionService,
    private fileSaverService: FileSaverService,
    private rotuer: Router,
    private gradeService: GradeService
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();

    this.isSubmitting = false;

    this.isTeacher = this.authService.isTeacher();

    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseId = params.courseId;
      this.courseService
        .getAssignment(params.courseId, params.assignmentId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (assignemnt) => {
            this.assignment = assignemnt;
            this.loadSubmissions();
            if (!this.isTeacher) {
              this.loadGrades();
            }
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

  loadSubmissions() {
    this.submissionService
      .getSubmissions(this.courseId, this.assignment.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (submissions) => {
          this.submissions = submissions;
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            "Something went wrong!"
          );
        }
      );
  }

  loadGrades() {
    this.gradeService
      .getGrades(this.courseId, this.assignment.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (grades) => {
          if (grades.length > 0) {
            this.grade = grades[0];
          } else {
            this.grade = undefined;
          }
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            "Something went wrong!"
          );
        }
      );
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

  onSubmitClicked() {
    this.isSubmitting = !this.isSubmitting;
  }

  onFileChange(fileChangeEvent) {
    this.file = fileChangeEvent.target.files[0];
  }

  uploadFile() {
    const formData = new FormData();
    formData.append("file", this.file);
    if (!!this.file) {
      this.submissionService
        .saveSubmission(this.courseId, this.assignment.id, formData)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (submission) => {
            this.toasterService.success(
              "File uploaded successfully!",
              "Congratulations!"
            );
            this.isSubmitting = false;
            this.file = null;
            this.loadSubmissions();
            if (!this.isTeacher) {
              this.loadGrades();
            }
          },
          (error) => {
            this.toasterService.error(error.error.message, "Please try again!");
          }
        );
    } else {
      this.toasterService.error("File is required!", "Please try again!");
    }
  }

  onSubmissionClicked(id, fileName: string) {
    this.submissionService
      .getSubmission(this.courseId, this.assignment.id, id)
      .pipe(takeUntil(this.stop))
      .subscribe((blob) => {
        this.fileSaverService.save(blob, fileName);
      });
  }

  goToSubmissions() {
    this.rotuer.navigate([
      `/courses/${this.courseId}/assignments/${this.assignment.id}/submissions`,
    ]);
  }
}
