import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SERVER_URL } from 'src/environments/environment';
import { AnnouncementFormComponent } from '../course-view/announcement-form/announcement-form.component';
import { AnnouncementComment } from '../model/announcement-comment.model';
import { Announcement } from '../model/announcement.model';
import { AuthService } from '../shared/auth.service';
import { BackButtonService } from '../shared/back-button.service';
import { CommentService } from '../shared/comment.service';
import { CourseService } from '../shared/course.service';
import { ToasterService } from '../shared/toaster.service';
import { AnnouncementCommentFormComponent } from './announcement-comment-form/announcement-comment-form.component';

@Component({
  selector: 'app-announcement-view',
  templateUrl: './announcement-view.component.html',
  styleUrls: ['./announcement-view.component.scss'],
})
export class AnnouncementViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();

  announcement: Announcement;
  courseId: number;

  isTeacher: boolean;
  username: string;

  creatorImageUrl: string;
  commentImageUrls: string[];

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

  ngOnInit(): void {
    this.backButtonService.turnOn();

    this.isTeacher = this.authService.isTeacher();
    this.username = this.authService.getUsername();

    this.loadAnnouncement();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadAnnouncement(): void {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseId = params.courseId;

      this.courseService
        .getAnnouncement(params.courseId, params.announcementId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (announcement) => {
            this.creatorImageUrl = this.getImageUrlById(
              announcement.creator.id
            );

            this.announcement = announcement;

            this.commentImageUrls = [];
            this.announcement.comments.forEach((comment) => {
              this.commentImageUrls[
                comment.commenter.id
              ] = this.getImageUrlById(comment.commenter.id);
            });
          },
          () => {
            this.toasterService.error(
              'Could not get announcement!',
              'Something went wrong!'
            );
          }
        );
    });
  }

  async presentAnnouncementModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AnnouncementFormComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        courseId: this.courseId,
        announcement: this.announcement,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  async presentCommentModal(comment?: AnnouncementComment): Promise<void> {
    const modal = await this.modalController.create({
      component: AnnouncementCommentFormComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        courseId: this.courseId,
        announcementId: this.announcement.id,
        comment,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  onEditClicked(comment: AnnouncementComment): void {
    this.presentCommentModal(comment);
  }

  async onDeleteClicked(commentId: number): Promise<void> {
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
              .deleteAnnouncementComment(
                this.courseId,
                this.announcement.id,
                commentId
              )
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    'Comment deletion successful!',
                    'Congratulations!'
                  );

                  this.loadAnnouncement();
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

  getImageUrlById(id: number): string {
    return SERVER_URL + '/user/' + id + '/image/?' + new Date().getTime();
  }
}
