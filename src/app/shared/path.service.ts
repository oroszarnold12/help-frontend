import { Location } from "@angular/common";
import { Injectable, OnInit } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PathService {
  private path = new BehaviorSubject<string>(localStorage.getItem("path"));

  path$ = this.path.asObservable();

  constructor(private location: Location) {
    this.path.next(localStorage.getItem("path"));
  }

  setPath(newPath: string): void {
    this.path.next(newPath);
    localStorage.setItem("path", newPath);
  }
}
