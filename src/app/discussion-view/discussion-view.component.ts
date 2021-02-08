import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { DiscussionFormComponent } from "../course-view/discussion-form/discussion-form.component";
import { Discussion } from "../model/discussion.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";
import { ToasterService } from "../shared/toaster.service";

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

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private backButtonService: BackButtonService,
    private authService: AuthService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();

    this.isTeacher = this.authService.isTeacher();

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
}
