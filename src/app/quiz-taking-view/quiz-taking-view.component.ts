import { Component, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { IonSlides } from "@ionic/angular";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Question } from "../model/question.model";
import { Quiz } from "../model/quiz.model";
import { BackButtonService } from "../shared/back-button.service";
import { QuestionService } from "../shared/question.service";
import { QuizSubmissionService } from "../shared/quiz-submission.service";
import { QuizTimerService } from "../shared/quiz-timer.service";
import { QuizService } from "../shared/quiz.service";
import { ToasterService } from "../shared/toaster.service";

@Component({
  selector: "app-quiz-taking-view",
  templateUrl: "./quiz-taking-view.component.html",
  styleUrls: ["./quiz-taking-view.component.scss"],
})
export class QuizTakingViewComponent implements OnInit {
  stop: Subject<void> = new Subject();
  questions: Question[];
  @ViewChild("slides") slides: IonSlides;
  timeLeft: number;
  oneThirdReached: boolean = false;
  questionsForm: FormArray;
  courseId: number;
  quizId: number;
  quiz: Quiz;
  secondPassedSubscription: Subscription;
  timeOutSubscription: Subscription;
  oneThirdReachedSubscription: Subscription;

  constructor(
    private backButtonService: BackButtonService,
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private quizService: QuizService,
    private quizSubmissionService: QuizSubmissionService,
    private router: Router,
    private quizTimerService: QuizTimerService
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();

    this.loadQuiz();
    this.loadQuestions();
  }

  ngOnDestroy(): void {
    this.quizTimerService.questionsForm = this.questionsForm;

    this.unsubscribeFromTimer();

    this.stop.next();
    this.stop.complete();
  }

  loadQuestions() {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseId = params.courseId;
      this.quizId = params.quizId;
      this.questionService
        .getQuestions(params.courseId, params.quizId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (questions) => {
            this.questions = questions;
            this.createFormGroup();

            if (!this.quizTimerService.isTimerSet()) {
              this.quizTimerService.start();
            } else {
              this.questionsForm = this.quizTimerService.questionsForm;
            }
          },
          (error) => {
            this.toasterService.error(
              "Could not get questions!",
              "Something went wrong!"
            );
          }
        );
    });
  }

  loadQuiz() {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.quizService
        .getQuiz(params.courseId, params.quizId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (quiz) => {
            this.quiz = quiz;
            const timeArray = quiz.timeLimit.split(":");
            if (!this.quizTimerService.isTimerSet()) {
              this.timeLeft =
                Number(timeArray[0]) * 3600 +
                Number(timeArray[1]) * 60 +
                Number(timeArray[2]);

              this.quizTimerService.setTimeLeft(this.timeLeft);
            }
            this.subscribeToTimer();
          },
          (error) => {
            this.toasterService.error(
              "Could not get quiz!",
              "Something went wrong!"
            );
          }
        );
    });
  }

  createFormGroup() {
    this.questionsForm = new FormArray([]);
    this.questions.forEach((question) => {
      const answerArray = new FormArray([]);
      question.answers.forEach((answer) => {
        answerArray.push(new FormControl(false));
      });

      this.questionsForm.push(answerArray);
    });
  }

  changeSlideTo(index) {
    this.slides.slideTo(index);
  }

  subscribeToTimer() {
    this.timeOutSubscription = this.quizTimerService.timeOut$.subscribe(() => {
      this.onSubmitClicked();
      this.oneThirdReached = false;
    });

    this.oneThirdReachedSubscription = this.quizTimerService.oneThirdReached$.subscribe(
      () => {
        this.playAudio();
        this.oneThirdReached = true;
      }
    );

    this.secondPassedSubscription = this.quizTimerService.secondPassed$.subscribe(
      (timeLeft) => {
        this.timeLeft = timeLeft;
      }
    );
  }

  unsubscribeFromTimer() {
    this.timeOutSubscription.unsubscribe();

    this.oneThirdReachedSubscription.unsubscribe();

    this.secondPassedSubscription.unsubscribe();
  }

  playAudio() {
    let audio = new Audio();
    audio.src = "../../../assets/sounds/time-low.mp3";
    audio.load();
    audio.play();
  }

  onSubmitClicked() {
    this.quizTimerService.stop();

    const quizSubmission = [];
    this.questions.forEach((question, i) => {
      question.answers.forEach((answer, j) => {
        quizSubmission.push({
          answerId: answer.id,
          picked: this.questionsForm.value[i][j],
        });
      });
    });

    this.quizSubmissionService
      .saveQuizSubmission(this.courseId, this.quizId, quizSubmission)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (questions) => {
          this.toasterService.success(
            "Answers saved successfuly!",
            "Congratulations!"
          );

          this.router.navigate(
            [`/courses/${this.courseId}/quizzes/${this.quizId}`],
            { replaceUrl: true }
          );
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }
}
