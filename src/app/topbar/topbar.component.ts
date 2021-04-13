import { Component, OnInit } from "@angular/core";
import { MenuController } from "@ionic/angular";
import { Location } from "@angular/common";
import { AuthService } from "../shared/auth.service";
import { ToasterService } from "../shared/toaster.service";
import { Subscription } from "rxjs";
import { LoginStatusService } from "../shared/login-status.service";
import { Router } from "@angular/router";
import { BackButtonService } from "../shared/back-button.service";
import { PathService } from "../shared/path.service";
import { url } from "../shared/api-config";
import { UserDetailsViewComponent } from "../user-details-view/user-details-view.component";
import { PersonService } from "../shared/person.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
  username: string;
  subscription: Subscription;
  path: string = "";
  imageUrl = url + "/user/image";
  admin: boolean;

  constructor(
    private menuController: MenuController,
    private location: Location,
    private authService: AuthService,
    private toasterService: ToasterService,
    private loginStatusService: LoginStatusService,
    private router: Router,
    private pathService: PathService,
    private personService: PersonService,
    public backButtonService: BackButtonService
  ) {
    this.subscription = loginStatusService.loggedIn$.subscribe((log) => {
      this.username = this.authService.getUsername();
    });

    this.personService.imageChanged$.subscribe((url) => {
      this.imageUrl = url;
    });
  }

  ngOnInit() {
    this.username = this.authService.getUsername();
    this.admin = this.authService.isAdmin();

    this.pathService.path$.subscribe((path) => {
      this.path = path;
    });
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

  onDashboardButtonClicked() {
    this.router.navigate(["/dashboard"]);
  }

  onCoursesButtonClicked() {
    this.router.navigate(["/participations"]);
  }

  onProfileSettingsClicked() {
    this.router.navigate(["user"]);
    this.closeMenu();
  }

  getPath(): string[] {
    return this.path.split("/");
  }
}
