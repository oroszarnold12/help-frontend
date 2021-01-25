import { Injectable } from "@angular/core";
import { LoadingController } from "@ionic/angular";
import { BehaviorSubject, Subscription } from "rxjs";
import { takeWhile } from "rxjs/operators";

@Injectable({
  providedIn: "root",
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

  presentLoader = async (value) => {
    if (value === true) {
      this.subscription.unsubscribe();
      const loading = await this.loadingController.create({
        spinner: "circular",
        translucent: true,
      });
      loading.present().then(() => {
        this.subscription = this.isLoading$
          .pipe(takeWhile((value) => value === true, true))
          .subscribe(this.dismissLoader);
      });
    }
  };

  dismissLoader = (value) => {
    if (value === false) {
      this.subscription.unsubscribe();
      this.loadingController.dismiss();
      this.subscription = this.isLoading$
        .pipe(takeWhile((value) => value === false, true))
        .subscribe(this.presentLoader);
    }
  };

  changeStatus(log: boolean) {
    if (this.isLoading.getValue() !== log) {
      this.isLoading.next(log);
    }
  }
}
