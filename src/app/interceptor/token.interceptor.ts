import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const req1 = '/auth/login';
    const req2 = '/auth/logout';
    if (req.url.search(req1) === -1 && req.url.search(req2) === -1) {
      req = req.clone({ withCredentials: true });
    }

    return next.handle(req);
  }
}
