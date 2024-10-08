import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../model/login-request.model';
import { AuthService } from '../shared/auth.service';
import { ToasterService } from '../shared/toaster.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss'],
})
export class LogInComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toasterService: ToasterService
  ) {}

  onSubmit(authForm: NgForm): void {
    if (!authForm.valid) {
      return;
    }

    const loginRequest: LoginRequest = new LoginRequest();
    loginRequest.username = authForm.value.email;
    loginRequest.password = authForm.value.password;

    let response;
    this.authService.login(loginRequest).subscribe(
      (res) => {
        response = res;
      },
      (error) => {
        this.toasterService.error(error.error.message, 'Login failed!');
      },
      () => {
        if (response.status === 200) {
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      }
    );
    authForm.reset();
  }
}
