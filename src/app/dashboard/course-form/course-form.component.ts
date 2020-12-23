import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CourseCreation } from "src/app/model/course-creation.model";
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
  private stop: Subject<void> = new Subject();

  constructor(
    private modalController: ModalController,
    private toasterService: ToasterService,
    private courseService: CourseService
  ) {
    this.courseForm = this.createFormGroup();
  }

  ngOnInit() {}

  createFormGroup() {
    return new FormGroup({
      name: new FormControl("", Validators.required),
      longName: new FormControl("", Validators.required),
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  submitForm() {
    if (this.courseForm.valid) {
      this.courseCreation = this.courseForm.value;
      this.courseService
        .saveCourse(this.courseCreation)
        .pipe(takeUntil(this.stop))
        .subscribe((course) => {
          this.courseForm.reset();
          this.toasterService.success("Congratulations!", "Course created!");
        });
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
