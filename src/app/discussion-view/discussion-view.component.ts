import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlertController, ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { DiscussionFormComponent } from "../course-view/discussion-form/discussion-form.component";
import { Discussion } from "../model/discussion.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CommentService } from "../shared/comment.service";
import { CourseService } from "../shared/course.service";
import { ToasterService } from "../shared/toaster.service";
import { DiscussionCommentFormComponent } from "./discussion-comment-form/discussion-comment-form.component";

@Component({
  selector: "app-discussion-view",
  templateUrl: "./discussion-view.component.html",
  styleUrls: ["./discussion-view.component.scss"],
})
export class DiscussionViewComponent implements OnInit {
  discussion: Discussion;
  stop: Subject<void> = new Subject();
  isTeacher: boolean;
  courseId: number;
  username: string;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private backButtonService: BackButtonService,
    private authService: AuthService,
    private modalController: ModalController,
    private alertController: AlertController,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();

    this.isTeacher = this.authService.isTeacher();

    this.username = this.authService.getUsername();

    this.loadDiscussion();
  }

  loadDiscussion() {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseId = params.courseId;
      this.courseService
        .getDiscussion(params.courseId, params.discussionId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (discussion) => {
            this.discussion = discussion;
          },
          (error) => {
            this.toasterService.error(
              "Could not get discussion!",
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

  async presentDiscussionModal() {
    const modal = await this.modalController.create({
      component: DiscussionFormComponent,
      componentProps: {
        courseId: this.courseId,
        discussion: this.discussion,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  async presentCommentModal(comment) {
    const modal = await this.modalController.create({
      component: DiscussionCommentFormComponent,
      componentProps: {
        courseId: this.courseId,
        discussionId: this.discussion.id,
        comment: comment,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  onEditClicked(comment) {
    this.presentCommentModal(comment);
  }

  async onDeleteClicked(id) {
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
              .deleteDiscussionComment(this.courseId, this.discussion.id, id)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Comment deletion successful!",
                    "Congratulations!"
                  );
                  this.loadDiscussion();
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
}
