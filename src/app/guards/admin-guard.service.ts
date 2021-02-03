import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Role } from "../model/role.enum";
import { AuthService } from "../shared/auth.service";

@Injectable({
  providedIn: "root",
})
export class AdminGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    if (this.authService.isLoggedIn()) {
      if (this.authService.getRole() !== Role.ADMIN) {
        this.router.navigate(["/dashboard"]);
      }
    }
    return this.authService.isLoggedIn();
  }
}
