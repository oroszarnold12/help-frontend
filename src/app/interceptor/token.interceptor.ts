import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "../shared/auth.service";

@Injectable({ providedIn: "root" })
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const req1 = "/auth/login";
    const req2 = "/auth/logout";
    if (req.url.search(req1) === -1 && req.url.search(req2) === -1) {
      req = req.clone({ withCredentials: true });
    }
    return next.handle(req).pipe(
      catchError((err: any) => {
        if (err.status === 401) {
          return this.authService.logout();
        } else if (err.status === 403) {
          return this.authService.logout();
        } else if (/50?/.test(err.status)) {
          throw err;
        } else {
          throw err;
        }
      })
    );
  }
}
