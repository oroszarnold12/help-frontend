import { Component, OnInit } from "@angular/core";
import { MenuController } from "@ionic/angular";
import { Location } from "@angular/common";
import { BackButtonService } from "../shared/back-button.service";

@Component({
  selector: "app-topbar",
  templateUrl: "./topbar.component.html",
  styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
  constructor(
    private menuController: MenuController,
    private location: Location,
    public backButtonService: BackButtonService
  ) {}

  ngOnInit() {}

  closeMenu() {
    this.menuController.close();
  }

  backClicked() {
    this.location.back();
  }
}
