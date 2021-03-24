import { Injectable } from "@angular/core";
import { FormArray } from "@angular/forms";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class QuizTimerService {
  timerSet: boolean = false;
  interval;
  timeLeft: number;
  oneThird: number;

  questionsForm: FormArray;

  private timeOut = new Subject();
  timeOut$ = this.timeOut.asObservable();

  private oneThirdReached = new Subject();
  oneThirdReached$ = this.oneThirdReached.asObservable();

  private secondPassed = new Subject<number>();
  secondPassed$ = this.secondPassed.asObservable();

  constructor() {}

  start(): void {
    this.timerSet = true;

    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.secondPassed.next(this.timeLeft);
        if (this.timeLeft === this.oneThird) {
          this.oneThirdReached.next();
        }
      } else {
        clearInterval(this.interval);
        this.timerSet = false;
        this.timeOut.next();
      }
    }, 1000);
  }

  stop(): void {
    clearInterval(this.interval);
    this.timerSet = false;
  }

  isTimerSet(): boolean {
    return this.timerSet;
  }

  setTimeLeft(seconds: number) {
    this.timeLeft = seconds;
    this.oneThird = Math.floor(this.timeLeft / 3);
  }

  setQuestionsForm(questionsForm: FormArray): void {
    this.questionsForm = questionsForm;
  }

  getQuestionsForm(): FormArray {
    return this.questionsForm;
  }
}
