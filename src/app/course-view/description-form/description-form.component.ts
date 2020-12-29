import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Course } from "src/app/model/course.model";
import { CourseService } from "src/app/shared/course.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-description-form",
  templateUrl: "./description-form.component.html",
  styleUrls: ["./description-form.component.scss"],
})
export class DescriptionFormComponent implements OnInit {
  descriptionFrom: FormGroup;
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
    this.descriptionFrom = this.createFormGroup();
  }

  createFormGroup() {
    return new FormGroup({
      description: new FormControl(this.course.description, [
        Validators.required,
        Validators.maxLength(this.editorMaxLength),
      ]),
    });
  }
  d;

  dismissModal() {
    this.modalController.dismiss();
  }

  get errorControl() {
    return this.descriptionFrom.controls;
  }

  submitForm() {
    if (this.descriptionFrom.valid) {
      this.course.description = this.descriptionFrom.get("description").value;
      this.courseService
        .updateCourse(this.course, this.course.id)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (course) => {
            this.descriptionFrom.reset();
            this.toasterService.success(
              "Congratulations!",
              "Description updated!"
            );
            this.modalController.dismiss();
          },
          (error) => {
            this.toasterService.error(error.error, "Something went wrong!");
          }
        );
    } else {
      this.toasterService.error(
        "All fields are required!",
        "Description update failed!"
      );
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
