import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonSelect } from '@ionic/angular';
import { FileSaverService } from 'ngx-filesaver';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssignmentGrade } from '../model/assignment-grade.model';
import { Assignment } from '../model/assignment.model';
import { Submission } from '../model/submission.model';
import { AuthService } from '../shared/auth.service';
import { BackButtonService } from '../shared/back-button.service';
import { CommentService } from '../shared/comment.service';
import { CourseService } from '../shared/course.service';
import { GradeService } from '../shared/grade.service';
import { SubmissionService } from '../shared/submission.service';
import { ToasterService } from '../shared/toaster.service';
import { AssignmentComment } from '../model/assignment-comment.model';
import { SERVER_URL } from 'src/environments/environment';
import { Person } from '../model/person.model';

@Component({
  selector: 'app-submission-view',
  templateUrl: './submission-view.component.html',
  styleUrls: ['./submission-view.component.scss'],
})
export class SubmissionViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();
  submissions: Submission[];
  assignment: Assignment;
  participants: Person[];
  filteredParticipants: Person[];
  grades: number[] = [];
  gradesObject: AssignmentGrade[] = [];
  newGrades: number[] = [];

  courseId: number;
  assingmentId: number;

  uploadCommentContent: string;
  simpleCommentContent: string;
  updateCommentContent: string;
  commentCreation: AssignmentComment;
  editingComment: boolean[] = [];
  commentImageUrls: string[];

  username: string;

  @ViewChild('student') studentSelector: IonSelect;

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

  ngOnInit(): void {
    this.backButtonService.turnOn();
    this.loadSubmissions();
    this.loadParticipants();

    this.username = this.authService.getUsername();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadSubmissions(): void {
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
              'Something went wrong!'
            );
          }
        );
    });
  }

  loadParticipants(): void {
    this.courseService
      .getParticipants(this.courseId)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (participants) => {
          this.participants = participants;
          this.filteredParticipants = participants;
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            'Something went wrong!'
          );
        }
      );
  }

  loadAssingment(): void {
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
            'Could not get assignment!',
            'Something went wrong!'
          );
        }
      );
  }

  loadGrades(): void {
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
            'Something went wrong!'
          );
        }
      );
  }

  getSubmissionsBySubmitterId(submitterId: number): Submission[] {
    return this.submissions.filter(
      (submission) => submission.submitter.id === submitterId
    );
  }

  compareWith(o1: Person, o2: Person): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  grade(submitterEmail: string, submitterId: number): void {
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
          if (!!this.uploadCommentContent) {
            this.commentService
              .saveAssingmentComment(
                this.courseId,
                this.assingmentId,
                submitterEmail,
                this.uploadCommentContent
              )
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    'Grade with comment saved successfully!',
                    'Congratulations!'
                  );

                  this.loadAssingment();
                  this.uploadCommentContent = undefined;
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    'Please try again!'
                  );
                }
              );
          } else {
            this.toasterService.success(
              'Grade saved successfully!',
              'Congratulations!'
            );
          }
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
          this.loadGrades();
        }
      );
  }

  onSubmissionClicked(
    submissionId: number,
    fileName: string,
    fileId: number
  ): void {
    this.submissionService
      .getSubmissionFile(this.courseId, this.assingmentId, submissionId, fileId)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (blob) => {
          this.fileSaverService.save(blob, fileName);
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }

  onNextClicked(): void {
    const index = this.participants.findIndex(
      (participant) => participant.id === this.studentSelector.value.id
    );

    this.studentSelector.value =
      this.participants[(index + 1) % this.participants.length];
  }

  onPreviousClicked(): void {
    let index = this.participants.findIndex(
      (participant) => participant.id === this.studentSelector.value.id
    );

    index--;
    if (index < 0) {
      index = this.participants.length - 1;
    }

    this.studentSelector.value = this.participants[index];
  }

  getDifferenceInDays(date1: Date, date2: Date): string {
    let difference = '';
    const diffInMs = Math.abs(
      new Date(date2).getTime() - new Date(date1).getTime()
    );

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInSeconds = Math.floor(diffInMs / 1000);

    if (diffInDays > 0) {
      difference += diffInDays + 'd ';
    }

    if (diffInHours - 24 * diffInDays > 0) {
      difference += diffInHours - 24 * diffInDays + 'h ';
    }

    if (diffInMinutes - 60 * diffInHours > 0) {
      difference += diffInMinutes - 60 * diffInHours + 'm ';
    }

    if (diffInSeconds - 60 * diffInMinutes > 0) {
      difference += diffInSeconds - 60 * diffInMinutes + 's';
    }

    return difference;
  }

  async onDeleteClicked(id: number): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure that you want to delete this comment?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: () => {
            this.commentService
              .deleteAssingmentComment(this.courseId, this.assingmentId, id)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    'Comment deletion successful!',
                    'Congratulations!'
                  );
                  this.loadAssingment();
                },
                (error) => {
                  console.log(error);
                  this.toasterService.error(
                    error.error.message,
                    'Please try again!'
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  onLeaveCommentClicked(submitterEmail: string): void {
    this.commentService
      .saveAssingmentComment(
        this.courseId,
        this.assingmentId,
        submitterEmail,
        this.simpleCommentContent
      )
      .pipe(takeUntil(this.stop))
      .subscribe(
        (comment) => {
          this.toasterService.success(
            'Comment saved successfully!',
            'Congratulations!'
          );

          this.loadAssingment();
          this.simpleCommentContent = undefined;
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }

  onEditClicked(comment: AssignmentComment): void {
    this.editingComment[comment.id] = true;
    this.updateCommentContent = comment.content;
  }

  onCancelClicked(commentId: number): void {
    this.editingComment[commentId] = false;
    this.updateCommentContent = undefined;
  }

  onUpdateClicked(commentId: number): void {
    this.commentCreation = {};
    this.commentCreation.content = this.updateCommentContent;
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
            'Comment updated successfully!',
            'Congratulations!'
          );

          this.loadAssingment();
          this.updateCommentContent = undefined;
          this.editingComment[commentId] = false;
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }

  onDownloadAllClicked(): void {
    this.submissionService
      .getFilesOfAssignment(this.courseId, this.assingmentId)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (blob) => {
          this.fileSaverService.save(
            blob,
            (this.assignment.name + '_submissions.zip').replace(/ +/g, '_')
          );
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }

  getImageUrlById(id: number): string {
    return SERVER_URL + '/user/' + id + '/image/?' + new Date().getTime();
  }

  getComments(submitterId: number): AssignmentComment[] {
    return this.assignment.comments.filter((comment) => {
      return comment.recipient.id === submitterId;
    });
  }

  onGradeChangedInTable(studentId: number, event: CustomEvent): void {
    this.newGrades[studentId] = Number(event.detail.value);
  }

  onGradeLostFocusInTable(studentId: number, studentEmail: string): void {
    if (this.newGrades[studentId] !== this.grades[studentId]) {
      this.grades[studentId] = this.newGrades[studentId];
      this.grade(studentEmail, studentId);
    }
  }

  onFilterParticipants(event: CustomEvent): void {
    if (event.detail.value !== '') {
      this.filteredParticipants = this.participants.filter((participant) => {
        return (
          participant.firstName
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase()) ||
          participant.lastName
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase())
        );
      });
    } else {
      this.filteredParticipants = this.participants;
    }
  }
}
