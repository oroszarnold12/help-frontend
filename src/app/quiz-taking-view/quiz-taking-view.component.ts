import { Time } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { IonSlides } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil, takeWhile } from "rxjs/operators";
import { Answer } from "../model/answer.model";
import { Question } from "../model/question.model";
import { BackButtonService } from "../shared/back-button.service";
import { QuestionService } from "../shared/question.service";
import { QuizSubmissionService } from "../shared/quiz-submission.service";
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
  oneThird: number;
  interval;
  questionsForm: FormArray;
  courseId: number;
  quizId: number;

  constructor(
    private backButtonService: BackButtonService,
    private questionService: QuestionService,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private quizService: QuizService,
    private quizSubmissionService: QuizSubmissionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();

    this.loadQuiz();
    this.loadQuestions();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  ngAfterViewInit(): void {
    this.startTimer();
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
            const timeArray = quiz.timeLimit.split(":");
            this.timeLeft =
              Number(timeArray[0]) * 3600 +
              Number(timeArray[1]) * 60 +
              Number(timeArray[2]);
            this.oneThird = Math.floor(this.timeLeft / 3);
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

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        if (this.timeLeft === this.oneThird) {
          this.playAudio();
        }
      } else {
        clearInterval(this.interval);
        this.onSubmitClicked();
      }
    }, 1000);
  }

  playAudio() {
    let audio = new Audio();
    audio.src = "../../../assets/sounds/time-low.mp3";
    audio.load();
    audio.play();
  }

  onSubmitClicked() {
    clearInterval(this.interval);
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

          this.router.navigate([
            `/courses/${this.courseId}/quizzes/${this.quizId}`,
          ]);
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }
}
