import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../shared/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.canLoad();
  }

  canLoad() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(["login"]);
    } else if (this.authService.isAdmin()) {
      this.router.navigate(["admin"]);
    }

    return this.authService.isLoggedIn();
  }
}
