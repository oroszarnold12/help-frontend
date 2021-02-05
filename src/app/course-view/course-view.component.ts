import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
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
import { InvitationCreation } from "../model/invitation.creation.model";
import { ThinPerson } from "../model/thin.person.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { CourseService } from "../shared/course.service";
import { DefaultSlideService } from "../shared/default-slide.service";
import { InvitationService } from "../shared/invitation.service";
import { PersonService } from "../shared/person.service";
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
  thinPersons: ThinPerson[];
  personsToInvite: ThinPerson[];

  settings: any;
  availablePersonsSettings: any;
  personsToInviteSettings: any;
  defaultSlide: number;

  isTeacher: boolean;
  canDelete: boolean;

  constructor(
    private backButtonService: BackButtonService,
    private route: ActivatedRoute,
    private courseService: CourseService,
    private toasterService: ToasterService,
    private datePite: DatePipe,
    private defaultSlideService: DefaultSlideService,
    private modalController: ModalController,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router,
    private personService: PersonService,
    private invitationService: InvitationService
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

    this.availablePersonsSettings = {
      selectMode: "multi",
      actions: {
        add: false,
        edit: false,
        delete: false,
      },
      columns: {
        firstName: {
          title: "First name",
        },
        lastName: {
          title: "Last name",
        },
        email: {
          title: "Email address",
          filter: false,
        },
      },
    };

    this.defaultSlide = defaultSlideService.getDefaultSlide();
    this.personsToInvite = [];
  }

  ngOnInit() {
    this.backButtonService.turnOn();
    this.loadCourse();
    this.isTeacher = this.authService.isTeacher();
    if (this.isTeacher) {
      this.loadPersons();
    }
  }

  ngOnDestroy(): void {
    this.backButtonService.turnOff();
    this.stop.next();
    this.stop.complete();
  }

  loadPersons() {
    this.personService
      .getPersons()
      .pipe(takeUntil(this.stop))
      .subscribe(({ persons }) => {
        this.thinPersons = persons;
      });
  }

  loadCourse(): void {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseService
        .getCourse(params.id)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (course) => {
            this.course = course;
            this.canDelete =
              this.course.teacher.email === this.authService.getUsername();
            this.createAssignmentOverviews();
            this.createAnnouncementOverviews();
            this.createGradeOverviews();
            this.createDiscussionOverviews();
          },
          (error) => {
            this.toasterService.error("Course not found!", "Selection failed!");
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
          this.loadCourse();
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

  viewAnnouncement(event) {
    this.router.navigate([`/courses/${this.course.id}/announcements/${event}`]);
  }

  viewAssignment(event) {
    this.router.navigate([`/courses/${this.course.id}/assignments/${event}`]);
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
            this.courseService
              .deleteAnnouncement(this.course.id, event)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Announcement deletion successful!",
                    "Congratulations!"
                  );
                  this.loadCourse();
                },
                (error) => {
                  this.toasterService.error(error.error, "Please try again!");
                }
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
            this.courseService
              .deleteAssignment(this.course.id, event)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Assignment deletion successful!",
                    "Congratulations!"
                  );
                  this.loadCourse();
                },
                (error) => {
                  this.toasterService.error(error.error, "Please try again!");
                }
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

  async deleteCourse(event) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this course?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.courseService
              .deleteCourse(this.course.id)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Course deletion successful!",
                    "Congratulations!"
                  );
                  this.router.navigate(["/dashboard"]);
                },

                (error) => {
                  this.toasterService.error(
                    "Course deletion failed!",
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

  async presentAnnouncementModal() {
    const modal = await this.modalController.create({
      component: AnnouncementFormComponent,
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  async presentAssignmentModal() {
    const modal = await this.modalController.create({
      component: AssignmentFormComponent,
      componentProps: {
        courseId: this.course.id,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  async presentDiscussionModal() {
    const modal = await this.modalController.create({
      component: DiscussionFormComponent,
      componentProps: {
        course: this.course,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

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

  onUserRowSelected(event) {
    this.personsToInvite = event.selected;
  }

  inviteClicked() {
    if (this.personsToInvite.length) {
      const invitations: InvitationCreation = {};
      invitations.courseId = this.course.id;
      invitations.emails = [];
      this.personsToInvite.forEach((person) => {
        invitations.emails.push(person.email);
      });
      this.invitationService
        .saveInvitation(invitations)
        .pipe(takeUntil(this.stop))
        .subscribe(
          () => {
            this.toasterService.success(
              "Invitations sent!",
              "Congratulations!"
            );
          },
          (error) => {
            console.log(error);
            this.toasterService.error(
              error.error,
              "Sending invitations failed!"
            );
          }
        );
    } else {
      this.toasterService.error(
        "The invitation list must contain atleast one person!",
        "Sending invitations failed!"
      );
    }
  }
}
