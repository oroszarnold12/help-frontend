import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuizFormComponent } from '../course-view/quiz-form/quiz-form.component';
import { Question } from '../model/question.model';
import { QuizGrade } from '../model/quiz-grade.model';
import { QuizSubmission } from '../model/quiz-submission.model';
import { Quiz } from '../model/quiz.model';
import { AuthService } from '../shared/auth.service';
import { BackButtonService } from '../shared/back-button.service';
import { GradeService } from '../shared/grade.service';
import { QuestionService } from '../shared/question.service';
import { QuizSubmissionService } from '../shared/quiz-submission.service';
import { QuizService } from '../shared/quiz.service';
import { ToasterService } from '../shared/toaster.service';
import { QuestionFormComponent } from './question-form/question-form.component';

@Component({
  selector: 'app-quiz-view',
  templateUrl: './quiz-view.component.html',
  styleUrls: ['./quiz-view.component.scss'],
})
export class QuizViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();

  quiz: Quiz;
  questions: Question[];
  quizSubmissions: QuizSubmission[];
  grade: QuizGrade;

  isTeacher: boolean;

  courseId: number;

  constructor(
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private backButtonService: BackButtonService,
    private authService: AuthService,
    private modalController: ModalController,
    private quizService: QuizService,
    private questionService: QuestionService,
    private alertController: AlertController,
    private router: Router,
    private quizSubmissionService: QuizSubmissionService,
    private gradeService: GradeService
  ) {}

  ngOnInit(): void {
    this.backButtonService.turnOn();

    this.isTeacher = this.authService.isTeacher();

    this.loadQuiz();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadQuiz(): void {
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
            } else {
              this.loadQuizSubmissions();
              this.loadGrades();
            }
          },
          () => {
            this.toasterService.error(
              'Could not get quiz!',
              'Something went wrong!'
            );
          }
        );
    });
  }

  loadQuestions(): void {
    this.questionService
      .getQuestions(this.courseId, this.quiz.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (questions) => {
          this.questions = questions;
        },
        () => {
          this.toasterService.error(
            'Could not get questions!',
            'Something went wrong!'
          );
        }
      );
  }

  loadQuizSubmissions(): void {
    this.quizSubmissionService
      .getSubmissions(this.courseId, this.quiz.id)
      .pipe(takeUntil(this.stop))
      .subscribe((quizSubmissions) => {
        this.quizSubmissions = quizSubmissions;

        if (this.quizSubmissions.length !== 0) {
          this.loadQuestions();
        }
      });
  }

  loadGrades(): void {
    this.gradeService
      .getGradesOfQuiz(this.courseId, this.quiz.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (grades) => {
          if (grades.length > 0) {
            this.grade = grades[0];
          } else {
            this.grade = undefined;
          }
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            'Something went wrong!'
          );
        }
      );
  }

  checkIfPicked(answer, index): boolean {
    let picked = false;
    this.quizSubmissions[index].answerSubmissions.forEach((answer1) => {
      if (answer1.answer.id === answer.id) {
        picked = answer1.picked;
      }
    });

    return picked;
  }

  editQuestion(questionId): void {
    this.presentQuestionModal(
      this.questions.find((question) => question.id === questionId)
    );
  }

  async deleteQuestion(questionId): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure that you want to delete this question?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: () => {
            this.questionService
              .deleteQuestion(this.courseId, this.quiz.id, questionId)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    'Question deletion successful!',
                    'Congratulations!'
                  );

                  this.loadQuiz();
                  this.loadQuestions();
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    'Please try again!'
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  async presentQuizModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: QuizFormComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        courseId: this.courseId,
        quiz: this.quiz,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  async presentQuestionModal(question?: Question): Promise<void> {
    const modal = await this.modalController.create({
      component: QuestionFormComponent,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        courseId: this.courseId,
        quizId: this.quiz.id,
        question,
      },
    });

    modal.onDidDismiss().then(() => this.ngOnInit());

    await modal.present();
  }

  onTakeClicked(): void {
    this.router.navigate([
      `courses/${this.courseId}/quizzes/${this.quiz.id}/questions`,
    ]);
  }

  modifyPublished(published: boolean): void {
    this.quiz.published = published;
    this.quizService
      .updateQuiz(this.quiz, this.courseId, this.quiz.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        () => {
          this.toasterService.success(
            'Congratulations!',
            published ? 'Quiz published!' : 'Quiz is hidden'
          );
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }
}
