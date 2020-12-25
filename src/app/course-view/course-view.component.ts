import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  AlertController,
  IonSegment,
  IonSlides,
  ModalController,
} from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Course } from "../model/course.model";
import { GeneralOverview } from "../model/general-overview.model";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";
import { DefaultSlideService } from "../shared/default-slide.service";
import { ToasterService } from "../shared/toaster.service";
import { AnnouncementFormComponent } from "./announcement-form/announcement-form.component";
import { AssignmentFormComponent } from "./assignment-form/assignment-form.component";
import { DescriptionFormComponent } from "./description-form/description-form.component";
import { DiscussionFormComponent } from "./discussion-form/discussion-form.component";

@Component({
  selector: "app-course-view",
  templateUrl: "./course-view.component.html",
  styleUrls: ["./course-view.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CourseViewComponent implements OnInit {
  stop: Subject<void> = new Subject();
  course: Course;
  @ViewChild("slides") slides: IonSlides;
  @ViewChild("segments") segments: IonSegment;
  options = {
    speed: 400,
    initialSlide: this.defaultSlideService.getDefaultSlide(),
  };

  assignmentOverviews: GeneralOverview[];
  announcementOverviews: GeneralOverview[];
  discussionOverviews: GeneralOverview[];
  gradeOverviews: any;

  settings: any;
  defaultSlide: number;

  constructor(
    private backButtonService: BackButtonService,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private toasterService: ToasterService,
    private datePite: DatePipe,
    private defaultSlideService: DefaultSlideService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    this.settings = {
      actions: {
        add: false,
        edit: false,
        delete: false,
      },
      columns: {
        name: {
          title: "Name",
          filter: false,
        },
        dueDate: {
          title: "Due",
          filter: false,
        },
        points: {
          title: "Points",
          filter: false,
        },
      },
    };

    this.defaultSlide = defaultSlideService.getDefaultSlide();
  }

  ngOnInit() {
    this.backButtonService.turnOn();
    this.loadCourse();
  }

  ngOnDestroy(): void {
    this.backButtonService.turnOff();
    this.stop.next();
    this.stop.complete();
  }

  loadCourse(): void {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseService
        .getCourse(params.id)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (course) => {
            this.course = course;
            this.createAssignmentOverviews();
            this.createAnnouncementOverviews();
            this.createGradeOverviews();
            this.createDiscussionOverviews();
          },
          (error) => {
            this.toasterService.error("Course not found", "Selection failed");
          }
        );
    });
  }

  saveCourse(message: string, errorMessage: string): void {
    this.courseService
      .updateCourse(this.course, this.course.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (course) => {
          this.toasterService.success(message, "Congratulations!");
          this.ngOnInit();
        },
        (error) => {
          this.toasterService.error(errorMessage, "Please try again!");
        }
      );
  }

  createAssignmentOverviews() {
    const { assignments } = this.course;
    this.assignmentOverviews = assignments.map((assignment) => ({
      id: assignment.id,
      name: assignment.name,
      description: `Due: ${this.datePite.transform(
        new Date(assignment.dueDate),
        "medium"
      )} | 
        Points: ${assignment.points}`,
    }));
  }

  private stripHtml(text) {
    var div = document.createElement("div");
    div.innerHTML = text;
    return div.textContent || div.innerText || "";
  }

  createAnnouncementOverviews() {
    const { announcements } = this.course;
    this.announcementOverviews = announcements.map((announcement) => ({
      id: announcement.id,
      name: announcement.name,
      description: `${this.stripHtml(announcement.content).slice(0, 100)}... | 
      Date: ${this.datePite.transform(new Date(announcement.date), "medium")} `,
    }));
  }

  createGradeOverviews() {
    const { assignments } = this.course;
    this.gradeOverviews = assignments.map((assignment) => ({
      name: assignment.name,
      dueDate: this.datePite.transform(new Date(assignment.dueDate), "medium"),
      points: assignment.points,
    }));
  }

  createDiscussionOverviews() {
    const { discussions } = this.course;
    this.discussionOverviews = discussions.map((discussion) => ({
      id: discussion.id,
      name: discussion.name,
      description: `Date: ${this.datePite.transform(
        new Date(discussion.date),
        "medium"
      )} | 
      Nr. of comments: ${discussion.comments.length}`,
    }));
  }

  segmentChanged(event) {
    this.slides.slideTo(event.detail.value);
  }

  ionSlideDidChange(): void {
    this.slides.getActiveIndex().then((index) => {
      this.segments.value = index.toString();
    });
  }

  async deleteAnnouncement(event) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this announcement?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.course.announcements = this.course.announcements.filter(
              (annoucement) => annoucement.id !== event
            );
            this.saveCourse(
              "Announcement deletion successful!",
              "Announcement deletion failed!"
            );
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteAssignment(event) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this assignment?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.course.assignments = this.course.assignments.filter(
              (assignment) => assignment.id !== event
            );
            this.saveCourse(
              "Assignment deletion successful!",
              "Assignemnt deletion failed!"
            );
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteDiscussion(event) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this discussion?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.course.discussions = this.course.discussions.filter(
              (discussion) => discussion.id !== event
            );
            this.saveCourse(
              "Discussion deletion successful!",
              "Discussion deletion failed!"
            );
          },
        },
      ],
    });

    await alert.present();
  }

  async presentAnnouncementModal() {
    const modal = await this.modalController.create({
      component: AnnouncementFormComponent,
      componentProps: {
        course: this.course,
      },
    });
    await modal.present();
  }

  async presentAssignmentModal() {
    const modal = await this.modalController.create({
      component: AssignmentFormComponent,
      componentProps: {
        course: this.course,
      },
    });
    await modal.present();
  }

  async presentDiscussionModal() {
    const modal = await this.modalController.create({
      component: DiscussionFormComponent,
      componentProps: {
        course: this.course,
      },
    });
    await modal.present();
  }

  async presentDescriptionModal() {
    const modal = await this.modalController.create({
      component: DescriptionFormComponent,
      componentProps: {
        course: this.course,
      },
    });
    await modal.present();
  }
}
