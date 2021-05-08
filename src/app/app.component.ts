import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './shared/auth.service';
import { LocalNotificationService } from './shared/local-notification.service';
import { FcmService } from './shared/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private localNotificationService: LocalNotificationService,
    private fcmService: FcmService
  ) {
    this.initializeApp();
  }

  initializeApp(): void {
    if (this.authService.isLoggedIn) {
      this.authService.pingBackend().subscribe(
        () => {},
        () => {
          this.authService.logout().subscribe(() => {});
        }
      );
    }

    this.fcmService.addListeners();
    this.localNotificationService.initLocal();

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
