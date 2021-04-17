import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoginStatusService {
  private loggedIn = new Subject<boolean>();
  loggedIn$ = this.loggedIn.asObservable();

  constructor() {}

  changeStatus(log: boolean) {
    this.loggedIn.next(log);
  }
}
