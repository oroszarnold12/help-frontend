import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Question } from "src/app/model/question.model";
import { QuestionService } from "src/app/shared/question.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-question-form",
  templateUrl: "./question-form.component.html",
  styleUrls: ["./question-form.component.scss"],
})
export class QuestionFormComponent implements OnInit {
  questionForm: FormGroup;
  newQuestion: Question;
  @Input() courseId: number;
  @Input() quizId: number;
  @Input() question: Question;
  private stop: Subject<void> = new Subject();

  constructor(
    private modalController: ModalController,
    private toasterService: ToasterService,
    private questionService: QuestionService
  ) {}

  ngOnInit() {
    this.questionForm = this.createFormGroup();
    if (!!this.question) {
      this.matchAnswers();
      this.questionForm.patchValue(this.question);
    }
  }

  createFormGroup() {
    return new FormGroup({
      content: new FormControl("", [
        Validators.required,
        Validators.maxLength(2048),
      ]),
      points: new FormControl("", [Validators.required, Validators.min(0)]),
      answers: new FormArray([
        new FormGroup({
          content: new FormControl("", [
            Validators.required,
            Validators.maxLength(2048),
          ]),
          correct: new FormControl(false),
        }),
        new FormGroup({
          content: new FormControl("", [
            Validators.required,
            Validators.maxLength(2048),
          ]),
          correct: new FormControl(false),
        }),
        new FormGroup({
          content: new FormControl("", [
            Validators.required,
            Validators.maxLength(2048),
          ]),
          correct: new FormControl(false),
        }),
        new FormGroup({
          content: new FormControl("", [
            Validators.required,
            Validators.maxLength(2048),
          ]),
          correct: new FormControl(false),
        }),
      ]),
    });
  }

  matchAnswers() {
    let currentNumberOfAnswers = this.answers.length;
    const targetNumberOfAnswers = this.question.answers.length;
    while (currentNumberOfAnswers != targetNumberOfAnswers) {
      if (currentNumberOfAnswers < targetNumberOfAnswers) {
        this.addAnswer();
        currentNumberOfAnswers++;
      } else {
        this.removeAnswer(currentNumberOfAnswers - 1);
        currentNumberOfAnswers--;
      }
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  get errorControl() {
    return this.questionForm.controls;
  }

  get answers() {
    return this.questionForm.controls.answers as FormArray;
  }

  removeAnswer(index: number) {
    if (this.answers.length <= 2) {
      this.toasterService.error(
        "A question should have atleast 2 answers!",
        "Can't remove answer!"
      );
    } else {
      this.answers.removeAt(index);
    }
  }

  addAnswer() {
    this.answers.push(
      new FormGroup({
        content: new FormControl("", [
          Validators.required,
          Validators.maxLength(2048),
        ]),
        correct: new FormControl(false),
      })
    );
  }

  clearAnswers() {
    this.answers.clear();
    for (let i = 0; i < 4; i++) {
      this.addAnswer();
    }
  }

  submitForm() {
    if (this.questionForm.valid) {
      if (!!this.question) {
        this.newQuestion = this.questionForm.value;
        this.questionService
          .updateQuestion(
            this.courseId,
            this.quizId,
            this.question.id,
            this.newQuestion
          )
          .pipe(takeUntil(this.stop))
          .subscribe(
            (question) => {
              this.questionForm.reset();
              this.toasterService.success(
                "Congratulations!",
                "Question updated!"
              );
              this.modalController.dismiss();
            },
            (error) => {
              this.toasterService.error(
                error.error.message,
                "Please try again!"
              );
            }
          );
      } else {
        this.newQuestion = this.questionForm.value;
        this.questionService
          .saveQuestion(this.courseId, this.quizId, this.newQuestion)
          .pipe(takeUntil(this.stop))
          .subscribe(
            (question) => {
              this.questionForm.reset();
              this.toasterService.success(
                "Congratulations!",
                "Question created!"
              );
              this.clearAnswers();
            },
            (error) => {
              this.toasterService.error(
                error.error.message,
                "Please try again!"
              );
            }
          );
      }
    } else {
      this.toasterService.error(
        "All fields are required!",
        "Question creation failed!"
      );
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
