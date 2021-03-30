import { Injectable } from "@angular/core";
import { PathService } from "./path.service";

@Injectable({
  providedIn: "root",
})
export class BackButtonService {
  private activeStatus = false;
  constructor(private pathService: PathService) {}

  isActive(): boolean {
    return this.activeStatus;
  }

  turnOn(): void {
    this.activeStatus = true;
  }

  turnOff(): void {
    this.activeStatus = false;
    this.pathService.setPath("Dashboard");
  }
}
