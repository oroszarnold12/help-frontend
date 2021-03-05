import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Quiz } from "src/app/model/quiz.model";
import { QuizService } from "src/app/shared/quiz.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-quiz-form",
  templateUrl: "./quiz-form.component.html",
  styleUrls: ["./quiz-form.component.scss"],
})
export class QuizFormComponent implements OnInit, OnDestroy {
  quizForm: FormGroup;
  newQuiz: Quiz;
  @Input() courseId: number;
  @Input() quiz: Quiz;
  private stop: Subject<void> = new Subject();
  editorMaxLength = 8192;

  editorStyle = {
    height: "300px",
  };

  config = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],

      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],

      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],

      ["link"],
    ],
  };

  constructor(
    private modalController: ModalController,
    private toasterService: ToasterService,
    private quizService: QuizService
  ) {}

  ngOnInit() {
    this.quizForm = this.createFormGroup();
    if (!!this.quiz) {
      this.quizForm.patchValue(this.quiz);
    }
  }

  createFormGroup() {
    return new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.maxLength(255),
      ]),
      description: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.editorMaxLength),
      ]),
      dueDate: new FormControl("", Validators.required),
      timeLimit: new FormControl("", Validators.required),
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  get errorControl() {
    return this.quizForm.controls;
  }

  submitForm() {
    if (this.quizForm.valid) {
      if (!!this.quiz) {
        this.newQuiz = this.quizForm.value;
        this.quizService
          .updateQuiz(this.newQuiz, this.courseId, this.quiz.id)
          .pipe(takeUntil(this.stop))
          .subscribe(
            (quiz) => {
              this.quizForm.reset();
              this.toasterService.success("Congratulations!", "Quiz updated!");
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
        this.newQuiz = this.quizForm.value;
        this.quizService
          .saveQuiz(this.newQuiz, this.courseId)
          .pipe(takeUntil(this.stop))
          .subscribe(
            (quiz) => {
              this.quizForm.reset();
              this.toasterService.success("Congratulations!", "Quiz created!");
              this.modalController.dismiss();
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
        "Quiz creation failed!"
      );
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
