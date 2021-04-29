import { Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { LocalNotificationActionPerformed, Plugins } from "@capacitor/core";

const { LocalNotifications } = Plugins;

@Injectable({
  providedIn: "root",
})
export class LocalNotificationService {
  constructor(private ngZone: NgZone, private router: Router) {}

  async initLocal(): Promise<void> {
    await LocalNotifications.requestPermission();

    LocalNotifications.addListener(
      "localNotificationActionPerformed",
      async (notificationAction: LocalNotificationActionPerformed) => {
        const data = notificationAction.notification.extra;

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

        if (data.forAnnouncement) {
          this.ngZone.run(() => {
            this.router.navigateByUrl(
              `/courses/${data.courseId}/announcements/${data.announcementId}`
            );
          });
        }

        if (data.forDiscussion) {
          this.ngZone.run(() => {
            this.router.navigateByUrl(
              `/courses/${data.courseId}/discussions/${data.discussionId}`
            );
          });
        }

        if (data.forInvitation) {
          this.ngZone.run(() => {
            this.router.navigateByUrl(`/dashboard`);
          });
        }

        if (data.forQuiz) {
          this.ngZone.run(() => {
            this.router.navigateByUrl(
              `/courses/${data.courseId}/quizzes/${data.quizId}`
            );
          });
        }

        if (data.forChat) {
          this.ngZone.run(() => {
            this.router.navigateByUrl(`/chat`);
          });
        }
      }
    );
  }

  async sendNotification(
    title: string,
    body: string,
    data: any
  ): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: title,
          body: body,
          extra: data,
        },
      ],
    });
  }
}
