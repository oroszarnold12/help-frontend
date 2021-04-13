import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../shared/auth.service";

@Injectable({
  providedIn: "root",
})
export class AdminGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    if (!this.authService.isAdmin()) {
      this.router.navigate(["/dashboard"]);
    }
    return this.authService.isAdmin();
  }
}
