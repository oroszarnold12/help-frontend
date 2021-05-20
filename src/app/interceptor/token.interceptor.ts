import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from '../shared/auth.service';
import { RetryService } from '../shared/retry.service';

@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private retryService: RetryService,
    private authService: AuthService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const req1 = '/auth/login';
    const req2 = '/auth/logout';
    if (req.url.search(req1) === -1 && req.url.search(req2) === -1) {
      req = req.clone({ withCredentials: true });
    }

    return next.handle(req).pipe(
      catchError((err: any) => {
        switch (err.status) {
          case 0: {
            this.retryService.showRetryPage();
            break;
          }
          case 401:
          case 403: {
            return this.authService.logout();
          }
          default: {
            this.retryService.hideRetryPage();
          }
        }

        return EMPTY;
      }),
      map((res) => {
        if (res.status >= 200 && res.status <= 299) {
          this.retryService.hideRetryPage();
        }

        return res;
      })
    );
  }
}
