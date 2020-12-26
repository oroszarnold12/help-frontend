import { Component, OnInit, Renderer2 } from "@angular/core";
import { MenuController } from "@ionic/angular";
import { Location } from "@angular/common";
import { BackButtonService } from "../shared/back-button.service";
import { AuthService } from "../shared/auth.service";
import { ToasterService } from "../shared/toaster.service";
import { Subscription } from "rxjs";
import { LoginStatusService } from "../shared/login-status.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
  username: string;
  subscription: Subscription;

  constructor(
    private menuController: MenuController,
    private location: Location,
    private authService: AuthService,
    private toasterService: ToasterService,
    private loginStatusService: LoginStatusService,
    public backButtonService: BackButtonService
  ) {
    this.subscription = loginStatusService.loggedIn$.subscribe((log) => {
      this.username = this.authService.getUsername();
    });
  }

  ngOnInit() {
    this.username = this.authService.getUsername();
  }

  closeMenu() {
    this.menuController.close();
  }

  backClicked() {
    this.location.back();
  }

  onLogOutClicked() {
    this.authService.logout().subscribe(() => {
      this.menuController.close();
      this.loginStatusService.changeStatus(false);
      this.toasterService.success("The log out was successful!");
    });
  }
}
