import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AlertController, ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { QuizFormComponent } from "../course-view/quiz-form/quiz-form.component";
import { Question } from "../model/question.model";
import { Quiz } from "../model/quiz.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { QuestionService } from "../shared/question.service";
import { QuizService } from "../shared/quiz.service";
import { ToasterService } from "../shared/toaster.service";
import { QuestionFormComponent } from "./question-form/question-form.component";

@Component({
  selector: "app-quiz-view",
  templateUrl: "./quiz-view.component.html",
  styleUrls: ["./quiz-view.component.scss"],
})
export class QuizViewComponent implements OnInit {
  quiz: Quiz;
  stop: Subject<void> = new Subject();
  isTeacher: boolean;
  courseId: number;
  questions: Question[];

  constructor(
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private backButtonService: BackButtonService,
    private authService: AuthService,
    private modalController: ModalController,
    private quizService: QuizService,
    private questionService: QuestionService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();

    this.isTeacher = this.authService.isTeacher();

    this.loadQuiz();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadQuiz() {
    this.route.params.pipe(takeUntil(this.stop)).subscribe((params) => {
      this.courseId = params.courseId;
      this.quizService
        .getQuiz(params.courseId, params.quizId)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (quiz) => {
            this.quiz = quiz;
            if (this.isTeacher) {
              this.loadQuestions();
            }
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

  loadQuestions() {
    this.questionService
      .getQuestions(this.courseId, this.quiz.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (questions) => {
          this.questions = questions;
        },
        (error) => {
          this.toasterService.error(
            "Could not get questions!",
            "Something went wrong!"
          );
        }
      );
  }

  editQuestion(questionId) {
    this.presentQuestionModal(
      this.questions.find((question) => question.id === questionId)
    );
  }

  async deleteQuestion(questionId) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this question?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.questionService
              .deleteQuestion(this.courseId, this.quiz.id, questionId)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Question deletion successful!",
                    "Congratulations!"
                  );
                  this.loadQuiz();
                  this.loadQuestions();
                },
                (error) => {
                  console.log(error);
                  this.toasterService.error(
                    error.error.message,
                    "Please try again!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async presentQuizModal() {
    const modal = await this.modalController.create({
      component: QuizFormComponent,
      componentProps: {
        courseId: this.courseId,
        quiz: this.quiz,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  async presentQuestionModal(question?) {
    const modal = await this.modalController.create({
      component: QuestionFormComponent,
      componentProps: {
        courseId: this.courseId,
        quizId: this.quiz.id,
        question: question,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }
}
