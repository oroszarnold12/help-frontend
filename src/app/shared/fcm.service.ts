import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import {
  Plugins,
  PushNotificationToken,
  PushNotificationActionPerformed,
  Capacitor,
} from "@capacitor/core";
import { PersonService } from "./person.service";
import { ToasterService } from "./toaster.service";

const { PushNotifications } = Plugins;

@Injectable({
  providedIn: "root",
})
export class FcmService {
  constructor(
    private personService: PersonService,
    private toasterService: ToasterService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  initPush() {
    if (Capacitor.platform !== "web") {
      this.registerPush();
    }
  }

  private registerPush(): void {
    PushNotifications.requestPermission().then((permission) => {
      if (permission.granted) {
        PushNotifications.register();
      } else {
        this.toasterService.error(
          "Registration for notifications failed!",
          "Permission denied!"
        );
      }
    });

    PushNotifications.addListener(
      "registration",
      (token: PushNotificationToken) => {
        this.personService.saveNotificationToken(token.value).subscribe(
          () => {},
          (error) => {
            this.toasterService.error(
              "Notification token saving failed!",
              "Try to log in again!"
            );
          }
        );
      }
    );

    PushNotifications.addListener("registrationError", (error: any) => {
      this.toasterService.error(
        "Registration for notifications failed!",
        "Try to log in again!"
      );
    });

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      async (notification: PushNotificationActionPerformed) => {
        const data = notification.notification.data;
        console.log(data);
        if (data.forAssignment) {
          this.ngZone.run(() => {
            this.router.navigateByUrl(
              `/courses/${data.courseId}/assignments/${data.assignmentId}`
            );
          });
        }
        if (data.forAssignmentSubmission) {
          this.ngZone.run(() => {
            this.router.navigateByUrl(
              `/courses/${data.courseId}/assignments/${data.assignmentId}/submissions`
            );
          });
        }
      }
    );
  }
}
