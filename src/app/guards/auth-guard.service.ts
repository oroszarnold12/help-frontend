import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    return this.canLoad();
  }

  canLoad(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['login']);
    }

    return this.authService.isLoggedIn();
  }
}
