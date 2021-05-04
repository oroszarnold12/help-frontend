import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { CourseService } from "../shared/course.service";
import { takeUntil } from "rxjs/operators";
import { Course } from "../model/course.model";
import { AlertController, ModalController } from "@ionic/angular";
import { CourseFormComponent } from "./course-form/course-form.component";
import { AuthService } from "../shared/auth.service";
import { Invitation } from "../model/invitation.model";
import { InvitationService } from "../shared/invitation.service";
import { GeneralOverview } from "../model/general-overview.model";
import { ToasterService } from "../shared/toaster.service";
import { ParticipationService } from "../shared/participation.service";
import { NavigationEnd, Router } from "@angular/router";
import { BackButtonService } from "../shared/back-button.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();

  courses: Course[];
  filteredCourses: Course[];

  teacher: boolean;

  invitations: Invitation[];
  invitationOverviews: GeneralOverview[];

  subscription: Subscription;

  constructor(
    private courseService: CourseService,
    private modalController: ModalController,
    private authService: AuthService,
    private invitationService: InvitationService,
    private alertController: AlertController,
    private toasterService: ToasterService,
    private participationService: ParticipationService,
    private router: Router,
    private bakcButtonService: BackButtonService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === "/dashboard") {
          this.ngOnInit();
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadInvitations();

    this.teacher = this.authService.isTeacher();

    this.bakcButtonService.turnOff();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadCourses(): void {
    this.courseService
      .getCourses()
      .pipe(takeUntil(this.stop))
      .subscribe(({ courses }) => {
        this.participationService
          .getParticipations()
          .pipe(takeUntil(this.stop))
          .subscribe((participations) => {
            this.courses = courses.filter((course) => {
              return participations.find(
                (participation) => participation.course.id === course.id
              ).showOnDashboard;
            });

            this.filteredCourses = this.courses;
          });
      });
  }

  loadInvitations(): void {
    this.invitationService
      .getInvitations()
      .pipe(takeUntil(this.stop))
      .subscribe(({ invitations }) => {
        this.invitations = invitations;

        this.createInvitationOverviews();
      });
  }

  createInvitationOverviews(): void {
    this.invitationOverviews = this.invitations.map((invitation) => ({
      id: invitation.id,
      name: `You have been invited to course: ${invitation.course.name}`,
      description: `${invitation.course.longName}`,
    }));
  }

  async acceptClicked(invitationId: number): Promise<void> {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to accept this invitation?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.invitationService
              .acceptInvitation(invitationId)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Invitation accepted!",
                    "Congratulations!"
                  );

                  this.ngOnInit();
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    "Accepting failed!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async declineClicked(invitationId: number): Promise<void> {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to decline this invitation?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.invitationService
              .declineInvitation(invitationId)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Invitation declined!",
                    "Congratulations!"
                  );

                  this.ngOnInit();
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    "Declining failed!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async presentModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: CourseFormComponent,
      cssClass: "my-custom-modal-css",
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  onFilterCourses(event: CustomEvent): void {
    if (event.detail.value !== "") {
      this.filteredCourses = this.courses.filter((course) => {
        return (
          course.name
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase()) ||
          course.name
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase())
        );
      });
    } else {
      this.filteredCourses = this.courses;
    }
  }
}
