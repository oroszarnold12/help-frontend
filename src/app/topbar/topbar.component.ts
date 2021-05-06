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
import { PersonService } from "../shared/person.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
  username: string;
  admin: boolean;
  subscription: Subscription;

  path: string;

  imageUrl: string;

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
    this.imageUrl = url + "/user/image";
    this.path = "";

    this.subscription = loginStatusService.loggedIn$.subscribe((log) => {
      this.username = this.authService.getUsername();
    });

    this.personService.imageChanged$.subscribe((url) => {
      this.imageUrl = url;
    });
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.admin = this.authService.isAdmin();

    this.pathService.path$.subscribe((path) => {
      this.path = path;
    });
  }

  closeMenu(): void {
    this.menuController.close();
  }

  backClicked(): void {
    this.location.back();
  }

  onLogOutClicked(): void {
    this.authService.logout().subscribe(
      () => {
        this.menuController.close();
        this.loginStatusService.changeStatus(false);
        this.toasterService.success("The log out was successful!");
      },
      () => {
        this.toasterService.error(
          "The logout was unsuccessful!",
          "Please try again!"
        );
      }
    );
  }

  onChatButtonClicked(): void {
    this.router.navigate(["/chat"]);
    this.menuController.close();
  }

  onDashboardButtonClicked(): void {
    this.router.navigate(["/dashboard"]);
    this.menuController.close();
  }

  onCoursesButtonClicked(): void {
    this.router.navigate(["/participations"]);
    this.menuController.close();
  }

  onProfileSettingsClicked(): void {
    this.router.navigate(["user"]);
    this.closeMenu();
  }

  getPath(): string[] {
    return this.path.split("/");
  }

  showExtendedMenu(): boolean {
    return window.screen.width <= 600;
  }
}
