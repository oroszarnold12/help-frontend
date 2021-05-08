import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DiscussionFormComponent } from '../course-view/discussion-form/discussion-form.component';
import { Discussion } from '../model/discussion.model';
import { url } from '../shared/api-config';
import { AuthService } from '../shared/auth.service';
import { BackButtonService } from '../shared/back-button.service';
import { CommentService } from '../shared/comment.service';
import { CourseService } from '../shared/course.service';
import { ToasterService } from '../shared/toaster.service';
import { DiscussionCommentFormComponent } from './discussion-comment-form/discussion-comment-form.component';

@Component({
  selector: 'app-discussion-view',
  templateUrl: './discussion-view.component.html',
  styleUrls: ['./discussion-view.component.scss'],
})
export class DiscussionViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();

  discussion: Discussion;

  isTeacher: boolean;
  username: string;

  courseId: number;

  creatorImageUrl: string;
  commentImageUrls: string[];

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

  ngOnInit(): void {
    this.backButtonService.turnOn();

    this.isTeacher = this.authService.isTeacher();
    this.username = this.authService.getUsername();

    this.loadDiscussion();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadDiscussion(): void {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseId = params.courseId;

      this.courseService
        .getDiscussion(params.courseId, params.discussionId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (discussion) => {
            this.discussion = discussion;
            this.creatorImageUrl = this.getImageUrlById(discussion.creator.id);

            this.commentImageUrls = [];
            this.discussion.comments.forEach((comment) => {
              this.commentImageUrls[
                comment.commenter.id
              ] = this.getImageUrlById(comment.commenter.id);
            });
          },
          () => {
            this.toasterService.error(
              'Could not get discussion!',
              'Something went wrong!'
            );
          }
        );
    });
  }

  async presentDiscussionModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: DiscussionFormComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        courseId: this.courseId,
        discussion: this.discussion,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  async presentCommentModal(comment?: Comment): Promise<void> {
    const modal = await this.modalController.create({
      component: DiscussionCommentFormComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        courseId: this.courseId,
        discussionId: this.discussion.id,
        comment,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  onEditClicked(comment: Comment): void {
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
              .deleteDiscussionComment(
                this.courseId,
                this.discussion.id,
                commentId
              )
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    'Comment deletion successful!',
                    'Congratulations!'
                  );

                  this.loadDiscussion();
                },
                (error) => {
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
    return url + '/user/' + id + '/image/?' + new Date().getTime();
  }
}
