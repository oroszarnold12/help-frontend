import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlertController, IonSelect } from "@ionic/angular";
import { FileSaverService } from "ngx-filesaver";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AssignmentGrade } from "../model/assignment-grade.model";
import { Assignment } from "../model/assignment.model";
import { Submission } from "../model/submission.model";
import { ThinPerson } from "../model/thin.person.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CommentService } from "../shared/comment.service";
import { CourseService } from "../shared/course.service";
import { GradeService } from "../shared/grade.service";
import { SubmissionService } from "../shared/submission.service";
import { ToasterService } from "../shared/toaster.service";
import * as JSZip from "jszip";
import { url } from "../shared/api-config";
import { AssignmentComment } from "../model/assignment-comment.model";

@Component({
  selector: "app-submission-view",
  templateUrl: "./submission-view.component.html",
  styleUrls: ["./submission-view.component.scss"],
})
export class SubmissionViewComponent implements OnInit, OnDestroy {
  submissions: Submission[];
  stop: Subject<void> = new Subject();
  grades: number[] = [];
  assignment: Assignment;
  participants: ThinPerson[];
  content: string;
  content2: string;
  content3: string;
  commentCreation: AssignmentComment;
  gradesObject: AssignmentGrade[] = [];
  editingComment: boolean[] = [];
  blobs: Blob[];

  courseId: number;
  assingmentId: number;

  username: string;

  commentImageUrls: string[];

  @ViewChild("student") studentSelector: IonSelect;

  constructor(
    private submissionService: SubmissionService,
    private backButtonService: BackButtonService,
    private toasterService: ToasterService,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private fileSaverService: FileSaverService,
    private gradeService: GradeService,
    private commentService: CommentService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();
    this.loadSubmissions();
    this.loadParticipants();

    this.username = this.authService.getUsername();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadSubmissions() {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.assingmentId = params.assignmentId;
      this.courseId = params.courseId;

      this.submissionService
        .getSubmissions(params.courseId, params.assignmentId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (submissions) => {
            this.submissions = submissions;
            this.loadGrades();
            this.loadAssingment();
          },
          (error) => {
            this.toasterService.error(
              error.error.message,
              "Something went wrong!"
            );
          }
        );
    });
  }

  loadParticipants() {
    this.courseService
      .getParticipants(this.courseId)
      .pipe(takeUntil(this.stop))
      .subscribe((participants) => {
        this.participants = participants;
      });
  }

  loadAssingment() {
    this.courseService
      .getAssignment(this.courseId, this.assingmentId)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (assignemnt) => {
          this.assignment = assignemnt;
          this.commentImageUrls = [];
          this.assignment.comments.forEach((comment) => {
            this.editingComment[comment.id] = false;
            this.commentImageUrls[comment.commenter.id] = this.getImageUrlById(
              comment.commenter.id
            );
          });
        },
        (error) => {
          this.toasterService.error(
            "Could not get assignment!",
            "Something went wrong!"
          );
        }
      );
  }

  loadGrades() {
    this.gradeService
      .getGradesOfAssignment(this.courseId, this.assingmentId)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (grades) => {
          grades.forEach((grade) => {
            this.grades[grade.submitter.id] = grade.grade;
            this.gradesObject[grade.submitter.id] = grade;
          });
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            "Something went wrong!"
          );
        }
      );
  }

  getSubmissionsBySubmitterId(submitterId: number) {
    return this.submissions.filter(
      (submission) => submission.submitter.id === submitterId
    );
  }

  compareWith(o1: ThinPerson, o2: ThinPerson) {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  grade(submitterEmail: string, submitterId: number) {
    this.gradeService
      .saveGradeOfAssignment(
        this.courseId,
        this.assingmentId,
        this.grades[submitterId],
        submitterId
      )
      .pipe(takeUntil(this.stop))
      .subscribe(
        (grade) => {
          if (!!this.content) {
            this.commentService
              .saveAssingmentComment(
                this.courseId,
                this.assingmentId,
                submitterEmail,
                this.content
              )
              .pipe(takeUntil(this.stop))
              .subscribe(
                (comment) => {
                  this.toasterService.success(
                    "Grade with comment saved successfully!",
                    "Congratulations!"
                  );

                  this.loadAssingment();
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
              "Grade saved successfully!",
              "Congratulations!"
            );
          }
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  onSubmissionClicked(id, fileName: string) {
    this.submissionService
      .getSubmission(this.courseId, this.assingmentId, id)
      .pipe(takeUntil(this.stop))
      .subscribe((blob) => {
        this.fileSaverService.save(blob, fileName);
      });
  }

  onNextClicked() {
    const index = this.participants.findIndex(
      (participant) => participant.id === this.studentSelector.value.id
    );

    this.studentSelector.value = this.participants[
      (index + 1) % this.participants.length
    ];
  }

  onPreviousClicked() {
    let index = this.participants.findIndex(
      (participant) => participant.id === this.studentSelector.value.id
    );

    index--;
    if (index < 0) {
      index = this.participants.length - 1;
    }

    this.studentSelector.value = this.participants[index];
  }

  getDifferenceInDays(date1: Date, date2: Date) {
    let difference = "";
    const diffInMs = Math.abs(
      new Date(date2).getTime() - new Date(date1).getTime()
    );

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInSeconds = Math.floor(diffInMs / 1000);

    if (diffInDays > 0) {
      difference += diffInDays + "d ";
    }

    if (diffInHours - 24 * diffInDays > 0) {
      difference += diffInHours - 24 * diffInDays + "h ";
    }

    if (diffInMinutes - 60 * diffInHours > 0) {
      difference += diffInMinutes - 60 * diffInHours + "m ";
    }

    if (diffInSeconds - 60 * diffInMinutes > 0) {
      difference += diffInSeconds - 60 * diffInMinutes + "s";
    }

    return difference;
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
              .deleteAssingmentComment(this.courseId, this.assingmentId, id)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Comment deletion successful!",
                    "Congratulations!"
                  );
                  this.loadAssingment();
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

  onLeaveCommentClicked(submitterEmail: string) {
    this.commentService
      .saveAssingmentComment(
        this.courseId,
        this.assingmentId,
        submitterEmail,
        this.content2
      )
      .pipe(takeUntil(this.stop))
      .subscribe(
        (comment) => {
          this.toasterService.success(
            "Comment saved successfully!",
            "Congratulations!"
          );

          this.loadAssingment();
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
        this.assingmentId,
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

          this.loadAssingment();
          this.content3 = undefined;
          this.editingComment[commentId] = false;
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  onDownloadAllClicked() {
    let count = 0;
    this.blobs = [];

    this.submissions.forEach((submission) => {
      this.submissionService
        .getSubmission(this.courseId, this.assingmentId, submission.id)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (blob) => {
            this.blobs[submission.id] = blob;
          },
          (error) => {
            this.toasterService.error(error.error.message, "Please try again!");
          },
          () => {
            count++;
          }
        );
    });

    let interval = setInterval(() => {
      if (count === this.submissions.length) {
        clearInterval(interval);
        this.downloadBlobs();
      }
    }, 500);
  }

  downloadBlobs() {
    let zip: JSZip = new JSZip();

    this.blobs.forEach((blob, index) => {
      const submission = this.submissions.find(
        (submission) => submission.id === index
      );
      zip.file(
        (
          submission.submitter.firstName +
          " " +
          submission.submitter.lastName +
          "/" +
          submission.fileName
        ).replace(/ +/g, "_"),
        blob
      );
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      this.fileSaverService.save(
        content,
        (this.assignment.name + "_submissions.zip").replace(/ +/g, "_")
      );

      this.toasterService.success(
        "The files are being saved!",
        "Congratulations!"
      );
    });
  }

  getImageUrlById(id: number): string {
    return url + "/user/" + id + "/image/?" + new Date().getTime();
  }

  getComments(submitterId: number): AssignmentComment[] {
    return this.assignment.comments.filter((comment) => {
      return comment.recipient.id === submitterId;
    });
  }
}
