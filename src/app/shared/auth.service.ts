import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SERVER_URL } from 'src/environments/environment';
import { LoginRequest } from '../model/login-request.model';
import { PersonSignup } from '../model/person-signup.model';
import { Person } from '../model/person.model';
import { Role } from '../model/role.enum';
import { FcmService } from './fcm.service';
import { LoginStatusService } from './login-status.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public loginStatus = new Subject<any>();

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private loginStatusService: LoginStatusService,
    private fcmService: FcmService
  ) {}

  login(loginRequest: LoginRequest): Observable<any> {
    return this.httpClient
      .post<LoginRequest>(`${SERVER_URL}/auth/login`, loginRequest, {
        withCredentials: true,
        observe: 'response',
      })
      .pipe(
        tap((res) => {
          this.fcmService.initPush();

          localStorage.setItem('role', res.body.role);
          localStorage.setItem('username', loginRequest.username);

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
      .get(`${SERVER_URL}/auth/logout`, {
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          localStorage.setItem('username', '');
          localStorage.setItem('role', '');

          this.router.navigate(['']);

          this.loginStatus.next({
            username: this.getUsername(),
            loggedIn: this.isLoggedIn(),
          });
          this.loginStatusService.changeStatus(false);
        })
      );
  }

  register(personSignup: PersonSignup): Observable<any> {
    return this.httpClient.post<Person>(
      `${SERVER_URL}/auth/sign-up`,
      personSignup
    );
  }

  pingBackend(): Observable<void> {
    return this.httpClient.get<void>(`${SERVER_URL}/server-status/ping`, {
      withCredentials: true,
    });
  }

  getUsername(): string {
    return localStorage.getItem('username');
  }

  getRole(): string {
    return localStorage.getItem('role');
  }

  isTeacher(): boolean {
    return localStorage.getItem('role') === Role.TEACHER;
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === Role.ADMIN;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('username');
  }
}
