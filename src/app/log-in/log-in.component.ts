import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { LoginRequest } from "../model/login-request.model";
import { AuthService } from "../shared/auth.service";

@Component({
  selector: "app-log-in",
  templateUrl: "./log-in.component.html",
  styleUrls: ["./log-in.component.scss"],
})
export class LogInComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

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
        console.log(error.message);
      },
      () => {
        if (response.status === 200) {
          this.router.navigate(["/dashboard"]);
        }
      }
    );
    authForm.reset();
  }
}
