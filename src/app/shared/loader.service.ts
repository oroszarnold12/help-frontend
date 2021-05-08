import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  subscription: Subscription;

  constructor(private loadingController: LoadingController) {
    this.subscription = this.isLoading$
      .pipe(takeWhile((value) => value === false, true))
      .subscribe(this.presentLoader);
  }

  presentLoader = async (value: boolean): Promise<void> => {
    if (value === true) {
      this.subscription.unsubscribe();
      const loading = await this.loadingController.create({
        spinner: 'circular',
        translucent: true,
      });

      loading.present().then(() => {
        this.subscription = this.isLoading$
          .pipe(takeWhile((subValue) => subValue === true, true))
          .subscribe(this.dismissLoader);
      });
    }
  }

  dismissLoader = (value: boolean): void => {
    if (value === false) {
      this.subscription.unsubscribe();
      this.loadingController.dismiss();

      this.subscription = this.isLoading$
        .pipe(takeWhile((subValue) => subValue === false, true))
        .subscribe(this.presentLoader);
    }
  }

  changeStatus(log: boolean): void {
    if (this.isLoading.getValue() !== log) {
      this.isLoading.next(log);
    }
  }
}
