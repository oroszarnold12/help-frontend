import { Component, OnDestroy, OnInit, Optional } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlertController, ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AnnouncementFormComponent } from "../course-view/announcement-form/announcement-form.component";
import { Announcement } from "../model/announcement.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CommentService } from "../shared/comment.service";
import { CourseService } from "../shared/course.service";
import { ToasterService } from "../shared/toaster.service";
import { AnnouncementCommentFormComponent } from "./announcement-comment-form/announcement-comment-form.component";

@Component({
  selector: "app-announcement-view",
  templateUrl: "./announcement-view.component.html",
  styleUrls: ["./announcement-view.component.scss"],
})
export class AnnouncementViewComponent implements OnInit, OnDestroy {
  announcement: Announcement;
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
    private commentService: CommentService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();

    this.isTeacher = this.authService.isTeacher();

    this.username = this.authService.getUsername();

    this.loadAnnouncement();
  }

  loadAnnouncement() {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseId = params.courseId;
      this.courseService
        .getAnnouncement(params.courseId, params.announcementId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (announcement) => {
            this.announcement = announcement;
          },
          (error) => {
            this.toasterService.error(
              "Could not get announcement!",
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

  async presentAnnouncementModal() {
    const modal = await this.modalController.create({
      component: AnnouncementFormComponent,
      componentProps: {
        courseId: this.courseId,
        announcement: this.announcement,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  async presentCommentModal(comment?) {
    const modal = await this.modalController.create({
      component: AnnouncementCommentFormComponent,
      componentProps: {
        courseId: this.courseId,
        announcementId: this.announcement.id,
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
              .deleteAnnouncementComment(
                this.courseId,
                this.announcement.id,
                id
              )
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Comment deletion successful!",
                    "Congratulations!"
                  );
                  this.loadAnnouncement();
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
