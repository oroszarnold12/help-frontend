import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AlertController, ModalController } from "@ionic/angular";
import { FileSaverService } from "ngx-filesaver";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AssignmentFormComponent } from "../course-view/assignment-form/assignment-form.component";
import { Assignment } from "../model/assignment.model";
import { AssignmentGrade } from "../model/assignment-grade.model";
import { Submission } from "../model/submission.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";
import { GradeService } from "../shared/grade.service";
import { SubmissionService } from "../shared/submission.service";
import { ToasterService } from "../shared/toaster.service";
import { CommentService } from "../shared/comment.service";
import { AssignmentGradeComment } from "../model/assignment-grade-comment.model";

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
  content2: string;
  content3: string;
  isSubmitting: boolean;
  submissions: Submission[];
  grade: AssignmentGrade;
  username: string;
  commentCreation: AssignmentGradeComment;
  editingComment: boolean[] = [];

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
    private gradeService: GradeService,
    private alertController: AlertController,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();

    this.isSubmitting = false;

    this.isTeacher = this.authService.isTeacher();

    this.username = this.authService.getUsername();

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
      .getGradesOfAssignment(this.courseId, this.assignment.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (grades) => {
          if (grades.length > 0) {
            this.grade = grades[0];
            this.grade.comments.forEach((comment) => {
              this.editingComment[comment.id] = false;
            });
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

  modifyPublished(published: boolean) {
    this.assignment.published = published;

    this.courseService
      .updateAssignment(this.assignment, this.courseId, this.assignment.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (assignment) => {
          this.toasterService.success(
            "Congratulations!",
            published ? "Assignment published!" : "Assignemnt is hidden!"
          );
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  goToSubmissions() {
    this.rotuer.navigate([
      `/courses/${this.courseId}/assignments/${this.assignment.id}/submissions`,
    ]);
  }

  async onDeleteClicked(id: number) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this comment?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.commentService
              .deleteAssingmentGradeComment(
                this.courseId,
                this.assignment.id,
                this.grade.id,
                id
              )
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Comment deletion successful!",
                    "Congratulations!"
                  );
                  this.loadGrades();
                },
                (error) => {
                  console.log(error);
                  this.toasterService.error(
                    error.error.message,
                    "Please try again!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  onLeaveCommentClicked() {
    this.commentCreation = {};
    this.commentCreation.content = this.content2;
    this.commentService
      .saveAssingmentGradeComment(
        this.courseId,
        this.assignment.id,
        this.grade.id,
        this.commentCreation
      )
      .pipe(takeUntil(this.stop))
      .subscribe(
        (comment) => {
          this.toasterService.success(
            "Comment saved successfully!",
            "Congratulations!"
          );

          this.loadGrades();
          this.content2 = undefined;
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  onEditClicked(comment) {
    this.editingComment[comment.id] = true;
    this.content3 = comment.content;
  }

  onCancelClicked(commentId) {
    this.editingComment[commentId] = false;
    this.content3 = undefined;
  }

  onUpdateClicked(commentId: number) {
    this.commentCreation = {};
    this.commentCreation.content = this.content3;
    this.commentService
      .updateAssingmentGradeComment(
        this.courseId,
        this.assignment.id,
        this.grade.id,
        commentId,
        this.commentCreation
      )
      .pipe(takeUntil(this.stop))
      .subscribe(
        (comment) => {
          this.toasterService.success(
            "Comment updated successfully!",
            "Congratulations!"
          );

          this.loadGrades();
          this.content3 = undefined;
          this.editingComment[commentId] = false;
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }
}
