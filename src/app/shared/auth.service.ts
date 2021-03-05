import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { tap } from "rxjs/operators";
import { LoginRequest } from "../model/login-request.model";
import { PersonSignup } from "../model/person-signup.model";
import { Person } from "../model/person.model";
import { Role } from "../model/role.enum";
import { url } from "./api-config";
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
      .post<LoginRequest>(`${url}/auth/login`, loginRequest, {
        withCredentials: true,
        observe: "response",
      })
      .pipe(
        tap((res) => {
          localStorage.setItem("role", res.body.role);
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
      .get(`${url}/auth/logout`, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          localStorage.setItem("username", "");
          localStorage.setItem("role", "");
          this.router.navigate([""]);
          this.loginStatus.next({
            username: this.getUsername(),
            loggedIn: this.isLoggedIn(),
          });
          this.loginStatusService.changeStatus(false);
        })
      );
  }

  register(personSignup: PersonSignup): Observable<any> {
    return this.httpClient.post<Person>(`${url}/auth/sign-up`, personSignup);
  }

  pingBackend(): Observable<void> {
    return this.httpClient.get<void>(`${url}/server-status/ping`, {
      withCredentials: true,
    });
  }

  getUsername() {
    return localStorage.getItem("username");
  }

  getRole() {
    return localStorage.getItem("role");
  }

  isTeacher(): boolean {
    return localStorage.getItem("role") === Role.TEACHER;
  }

  isAdmin(): boolean {
    return localStorage.getItem("role") === Role.ADMIN;
  }

  isLoggedIn() {
    return !!localStorage.getItem("username");
  }
}
