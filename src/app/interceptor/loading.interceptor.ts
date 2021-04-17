import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LoaderService } from "../shared/loader.service";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];

  constructor(private loaderService: LoaderService) {}

  removeRequest(req: HttpRequest<any>): void {
    const i = this.requests.indexOf(req);

    if (i >= 0) {
      this.requests.splice(i, 1);
    }

    this.loaderService.isLoading.next(this.requests.length > 0);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.requests.push(req);

    this.loaderService.isLoading.next(true);

    return next.handle(req).pipe(
      map((event) => {
        this.removeRequest(req);
        return event;
      })
    );
  }
}
