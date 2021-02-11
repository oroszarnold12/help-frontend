import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FileSaverService } from "ngx-filesaver";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Assignment } from "../model/assignment.model";
import { Submission } from "../model/submission.model";
import { ThinPerson } from "../model/thin.person.model";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";
import { SubmissionService } from "../shared/submission.service";
import { ToasterService } from "../shared/toaster.service";

@Component({
  selector: "app-submission-view",
  templateUrl: "./submission-view.component.html",
  styleUrls: ["./submission-view.component.scss"],
})
export class SubmissionViewComponent implements OnInit, OnDestroy {
  submissions: Submission[];
  stop: Subject<void> = new Subject();
  submitters: ThinPerson[];
  grades: number[] = [];
  assignment: Assignment;

  courseId: number;
  assingmentId: number;

  constructor(
    private submissionService: SubmissionService,
    private backButtonService: BackButtonService,
    private toasterService: ToasterService,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private fileSaverService: FileSaverService
  ) {}

  ngOnInit() {
    this.loadSubmissions();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadSubmissions() {
    this.backButtonService.turnOn();

    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.assingmentId = params.assignmentId;
      this.courseId = params.courseId;

      this.submissionService
        .getSubmissions(params.courseId, params.assignmentId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (submissions) => {
            this.submissions = submissions;
            this.loadSubmitters();
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

  loadAssingment() {
    this.courseService
      .getAssignment(this.courseId, this.assingmentId)
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
  }

  loadGrades() {
    this.submissions.forEach((submission) => {
      this.grades[submission.submitter.id] = submission.grade;
    });
  }

  getSubmissionsBySubmitterId(submitterId: number) {
    return this.submissions.filter(
      (submission) => submission.submitter.id === submitterId
    );
  }

  loadSubmitters() {
    this.submitters = [];
    this.submissions.forEach((submission) => {
      this.submitters.push(submission.submitter);
    });
    this.submitters = Array.from(
      new Set(this.submitters.map((submitter) => submitter.id))
    ).map((id) => {
      return this.submitters.find((submitter) => submitter.id === id);
    });
  }

  grade(submitterId: number) {
    const submissions = this.getSubmissionsBySubmitterId(submitterId);
    this.submissionService
      .putSubmission(
        this.courseId,
        this.assingmentId,
        submissions[0].id,
        this.grades[submitterId]
      )
      .pipe(takeUntil(this.stop))
      .subscribe(
        (submission) => {
          this.toasterService.success(
            "Submission graded successfully!",
            "Congratulations!"
          );
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  onSubmissionClicked(id, fileName: string) {
    this.submissionService
      .getSubmission(this.courseId, this.assignment.id, id)
      .pipe(takeUntil(this.stop))
      .subscribe((blob) => {
        this.fileSaverService.save(blob, fileName);
      });
  }
}
