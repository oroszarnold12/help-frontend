import { Component, OnInit } from "@angular/core";
import { MenuController } from "@ionic/angular";
import { Location } from "@angular/common";
import { BackButtonService } from "../shared/back-button.service";
import { AuthService } from "../shared/auth.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
  constructor(
    private menuController: MenuController,
    private location: Location,
    private authService: AuthService,
    public backButtonService: BackButtonService
  ) {}

  ngOnInit() {}

  closeMenu() {
    this.menuController.close();
  }

  backClicked() {
    this.location.back();
  }

  onLogOutClicked() {
    this.authService.logout().subscribe(() => {
      this.menuController.close();
    });
  }
}
