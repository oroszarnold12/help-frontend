import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AnnouncementFormComponent } from "../course-view/announcement-form/announcement-form.component";
import { Announcement } from "../model/announcement.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";
import { ToasterService } from "../shared/toaster.service";

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
}
