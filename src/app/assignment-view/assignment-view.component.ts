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
import { url } from "../shared/api-config";
import { AssignmentComment } from "../model/assignment-comment.model";

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
  content: string;
  content2: string;
  content3: string;
  isSubmitting: boolean;
  submissions: Submission[];
  grade: AssignmentGrade;
  username: string;
  commentCreation: AssignmentComment;
  editingComment: boolean[] = [];
  commentImageUrls: string[];

  private files: Blob[];
  numOfFiles = 1;

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

    this.loadAssignment();
  }

  loadAssignment() {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseId = params.courseId;
      this.courseService
        .getAssignment(params.courseId, params.assignmentId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (assignemnt) => {
            this.assignment = assignemnt;
            this.commentImageUrls = [];
            this.assignment.comments.forEach((comment) => {
              this.editingComment[comment.id] = false;
              this.commentImageUrls[
                comment.commenter.id
              ] = this.getImageUrlById(comment.commenter.id);
            });
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
      cssClass: "my-custom-modal-css",
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
    this.files = null;
    this.numOfFiles = 1;
  }

  onFileChange(fileChangeEvent, index) {
    if (!!!this.files) {
      this.files = [];
    }
    this.files[index] = fileChangeEvent.target.files[0];
  }

  onAddAnotherFileClicked() {
    if (this.numOfFiles < 5) {
      this.numOfFiles++;
    } else {
      this.toasterService.error(
        "The maximum number of files is 5!",
        "Something went wrong!"
      );
    }
  }

  onRemoveFileClicked() {
    if (!!!this.files) {
      this.files = [];
    }

    this.files[this.numOfFiles - 1] = null;
    if (this.numOfFiles > 1) {
      this.numOfFiles--;
    }
  }

  uploadFile() {
    if (!!this.files) {
      const formData = new FormData();
      this.files.forEach((file) => {
        formData.append("files", file);
      });

      this.submissionService
        .saveSubmission(this.courseId, this.assignment.id, formData)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (submission) => {
            if (!!this.content) {
              this.commentService
                .saveAssingmentComment(
                  this.courseId,
                  this.assignment.id,
                  this.authService.getUsername(),
                  this.content
                )
                .pipe(takeUntil(this.stop))
                .subscribe(
                  (comment) => {
                    this.toasterService.success(
                      "File with comment uploaded successfully!",
                      "Congratulations!"
                    );

                    this.isSubmitting = false;
                    this.files = null;
                    this.loadSubmissions();
                    if (!this.isTeacher) {
                      this.loadGrades();
                    }
                    this.content = undefined;
                  },
                  (error) => {
                    this.toasterService.error(
                      error.error.message,
                      "Please try again!"
                    );
                  }
                );
            } else {
              this.toasterService.success(
                "File uploaded successfully!",
                "Congratulations!"
              );

              this.isSubmitting = false;
              this.files = null;
              this.loadSubmissions();
              if (!this.isTeacher) {
                this.loadGrades();
              }
              this.content = undefined;
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

  onSubmissionClicked(id, fileName: string, fileId: number) {
    this.submissionService
      .getSubmissionFile(this.courseId, this.assignment.id, id, fileId)
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
              .deleteAssingmentComment(this.courseId, this.assignment.id, id)
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
    this.commentService
      .saveAssingmentComment(
        this.courseId,
        this.assignment.id,
        this.authService.getUsername(),
        this.content2
      )
      .pipe(takeUntil(this.stop))
      .subscribe(
        (comment) => {
          this.toasterService.success(
            "Comment saved successfully!",
            "Congratulations!"
          );

          this.loadAssignment();
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
      .updateAssignmentComment(
        this.courseId,
        this.assignment.id,
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

          this.loadAssignment();
          this.content3 = undefined;
          this.editingComment[commentId] = false;
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  getImageUrlById(id: number): string {
    return url + "/user/" + id + "/image/?" + new Date().getTime();
  }
}
