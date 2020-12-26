import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { tap } from "rxjs/operators";
import { LoginRequest } from "../model/login-request.model";
import { LoginStatusService } from "./login-status.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public loginStatus = new Subject<any>();

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private loginStatusService: LoginStatusService
  ) {}

  login(loginRequest: LoginRequest): Observable<any> {
    return this.httpClient
      .post<LoginRequest>("api/auth/login", loginRequest, {
        withCredentials: true,
        observe: "response",
      })
      .pipe(
        tap(() => {
          localStorage.setItem("username", loginRequest.username);
          this.loginStatus.next({
            username: this.getUsername(),
            loggedIn: this.isLoggedIn(),
          });
          this.loginStatusService.changeStatus(true);
        })
      );
  }

  logout(): Observable<any> {
    return this.httpClient
      .get("api/auth/logout", {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          localStorage.setItem("username", "");
          this.router.navigate([""]);
          this.loginStatus.next({
            username: this.getUsername(),
            loggedIn: this.isLoggedIn(),
          });
          this.loginStatusService.changeStatus(false);
        })
      );
  }

  pingBackend(): Observable<void> {
    return this.httpClient.get<void>("api/server-status/ping", {
      withCredentials: true,
    });
  }

  getUsername() {
    return localStorage.getItem("username");
  }

  isLoggedIn() {
    return !!localStorage.getItem("username");
  }
}
