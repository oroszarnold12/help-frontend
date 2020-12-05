import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { LoginRequest } from "../model/login-request.model";
import { AuthService } from "../shared/auth.service";
import { LoginStatusService } from "../shared/login-status.service";
import { ToasterService } from "../shared/toaster.service";

@Component({
  selector: "app-log-in",
  templateUrl: "./log-in.component.html",
  styleUrls: ["./log-in.component.scss"],
})
export class LogInComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toasterService: ToasterService,
    private loginStatusService: LoginStatusService
  ) {}

  ngOnInit() {}

  onSubmit(authForm: NgForm) {
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
        this.toasterService.error(JSON.stringify(error.error));
      },
      () => {
        if (response.status === 200) {
          this.loginStatusService.changeStatus(true);
          this.router.navigate(["/dashboard"]);
        }
      }
    );
    authForm.reset();
  }
}
