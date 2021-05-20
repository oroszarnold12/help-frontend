import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RetryService {
  private retryState = new Subject<boolean>();
  retryState$ = this.retryState.asObservable();

  constructor() {}

  showRetryPage(): void {
    this.retryState.next(true);
  }

  hideRetryPage(): void {
    this.retryState.next(false);
  }
}
