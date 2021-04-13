import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../shared/auth.service";

@Injectable({
  providedIn: "root",
})
export class TeacherGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.canLoad();
  }

  canLoad() {
    if (!this.authService.isTeacher()) {
      this.router.navigate(["dashboard"]);
    }

    return this.authService.isTeacher();
  }
}
