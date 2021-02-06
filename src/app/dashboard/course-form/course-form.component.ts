import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
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
export class CourseFormComponent implements OnInit {
  courseForm: FormGroup;
  courseCreation: CourseCreation;
  @Input() course: Course;
  private stop: Subject<void> = new Subject();

  editorMaxLength = 65536;
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
    private courseService: CourseService
  ) {}

  ngOnInit() {
    this.courseForm = this.createFormGroup();
    if (!!this.course) {
      this.courseForm.patchValue(this.course);
    }
  }

  createFormGroup() {
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

  dismissModal() {
    this.modalController.dismiss();
  }

  submitForm() {
    if (this.courseForm.valid) {
      if (!!this.course) {
        this.courseCreation = this.courseForm.value;
        this.courseService
          .updateCourse(this.courseCreation, this.course.id)
          .pipe(takeUntil(this.stop))
          .subscribe(
            (course) => {
              this.courseForm.reset();
              this.toasterService.success(
                "Congratulations!",
                "Course updated!"
              );
              this.modalController.dismiss();
            },
            (error) => {
              this.toasterService.error(error.error, "Please try again!");
            }
          );
      } else {
        this.courseCreation = this.courseForm.value;
        this.courseService
          .saveCourse(this.courseCreation)
          .pipe(takeUntil(this.stop))
          .subscribe(
            (course) => {
              this.courseForm.reset();
              this.toasterService.success(
                "Congratulations!",
                "Course created!"
              );
              this.modalController.dismiss();
            },
            (error) => {
              this.toasterService.error(error.error, "Please try again!");
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

  get errorControl() {
    return this.courseForm.controls;
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
