import { Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Plugins,
  PushNotificationToken,
  PushNotificationActionPerformed,
  Capacitor,
  PushNotification,
} from '@capacitor/core';
import { ConversationService } from './conversation.service';
import { LocalNotificationService } from './local-notification.service';
import { PersonService } from './person.service';
import { ToasterService } from './toaster.service';

const { PushNotifications } = Plugins;

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  constructor(
    private personService: PersonService,
    private toasterService: ToasterService,
    private router: Router,
    private ngZone: NgZone,
    private localNotificationService: LocalNotificationService,
    private covnersationService: ConversationService
  ) {}

  initPush(): void {
    if (Capacitor.platform !== 'web') {
      this.registerPush();
    }
  }

  private registerPush(): void {
    PushNotifications.requestPermission().then((permission) => {
      if (permission.granted) {
        PushNotifications.register();
      } else {
        this.toasterService.error(
          'Registration for notifications failed!',
          'Permission denied!'
        );
      }

      PushNotifications.addListener(
        'registration',
        (token: PushNotificationToken) => {
          this.personService.saveNotificationToken(token.value).subscribe(
            () => {},
            () => {
              this.toasterService.error(
                'Notification token saving failed!',
                'Try to log in again!'
              );
            }
          );
        }
      );

      PushNotifications.addListener('registrationError', () => {
        this.toasterService.error(
          'Registration for notifications failed!',
          'Try to log in again!'
        );
      });

      this.addListeners();
    });
  }

  addListeners(): void {
    if (Capacitor.platform !== 'web') {
      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotification) => {
          if (!(notification.data.forChat && this.router.url === '/chat')) {
            this.localNotificationService.sendNotification(
              notification.title,
              notification.body,
              notification.data
            );
          } else {
            this.covnersationService.onNewMessageReceived();
          }
        }
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        async (notification: PushNotificationActionPerformed) => {
          const data = notification.notification.data;

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
  }
}
