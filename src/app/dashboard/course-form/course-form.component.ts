import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CourseCreation } from "src/app/model/course-creation.model";
import { Course } from "src/app/model/course.model";
import { CourseService } from "src/app/shared/course.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-course-form",
  templateUrl: "./course-form.component.html",
  styleUrls: ["./course-form.component.scss"],
})
export class CourseFormComponent implements OnInit, OnDestroy {
  private stop: Subject<void> = new Subject();

  courseForm: FormGroup;
  courseCreation: CourseCreation;
  @Input() course: Course;

  editorMaxLength: number;
  editorStyle: any;
  editorConfig: any;

  constructor(
    private modalController: ModalController,
    private toasterService: ToasterService,
    private courseService: CourseService
  ) {
    this.editorMaxLength = 65536;
    this.editorStyle = {
      height: "300px",
    };
    this.editorConfig = {
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
  }

  ngOnInit(): void {
    this.courseForm = this.createFormGroup();

    if (!!this.course) {
      this.courseForm.patchValue(this.course);
    }
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.maxLength(255),
      ]),
      longName: new FormControl("", [
        Validators.required,
        Validators.maxLength(255),
      ]),
      description: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.editorMaxLength),
      ]),
    });
  }

  dismissModal(): void {
    this.modalController.dismiss();
  }

  submitForm(): void {
    if (this.courseForm.valid) {
      if (!!this.course) {
        this.courseCreation = this.courseForm.value;

        this.courseService
          .updateCourse(this.courseCreation, this.course.id)
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
              this.courseForm.reset();

              this.toasterService.success(
                "Congratulations!",
                "Course updated!"
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
        this.courseCreation = this.courseForm.value;

        this.courseService
          .saveCourse(this.courseCreation)
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
              this.courseForm.reset();

              this.toasterService.success(
                "Congratulations!",
                "Course created!"
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
      }
    } else {
      this.toasterService.error(
        "All fields are required!",
        "Course creation failed!"
      );
    }
  }

  get errorControl(): {
    [key: string]: AbstractControl;
  } {
    return this.courseForm.controls;
  }
}
