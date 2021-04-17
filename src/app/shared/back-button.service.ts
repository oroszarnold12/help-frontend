import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class BackButtonService {
  private activeStatus: boolean;
  constructor() {
    this.activeStatus = false;
  }

  isActive(): boolean {
    return this.activeStatus;
  }

  turnOn(): void {
    this.activeStatus = true;
  }

  turnOff(): void {
    this.activeStatus = false;
  }
}
