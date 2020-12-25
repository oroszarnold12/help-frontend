import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Assignment } from "src/app/model/assignment.model";
import { Course } from "src/app/model/course.model";
import { CourseService } from "src/app/shared/course.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-assignment-form",
  templateUrl: "./assignment-form.component.html",
  styleUrls: ["./assignment-form.component.scss"],
})
export class AssignmentFormComponent implements OnInit {
  assignmentFrom: FormGroup;
  newAssignment: Assignment;
  @Input() course: Course;
  private stop: Subject<void> = new Subject();
  editorMaxLength = 16384;

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
    this.assignmentFrom = this.createFormGroup();
  }

  createFormGroup() {
    return new FormGroup({
      name: new FormControl("", Validators.required),
      dueDate: new FormControl("", Validators.required),
      points: new FormControl("", Validators.required),
      description: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.editorMaxLength),
      ]),
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  get errorControl() {
    return this.assignmentFrom.controls;
  }

  submitForm() {
    if (this.assignmentFrom.valid) {
      this.newAssignment = this.assignmentFrom.value;
      this.course.assignments.push(this.newAssignment);
      this.courseService
        .updateCourse(this.course, this.course.id)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (course) => {
            this.assignmentFrom.reset();
            this.toasterService.success(
              "Congratulations!",
              "Assignment created!"
            );
          },
          (error) => {
            this.toasterService.error("Something went wrong!", error.error);
          }
        );
    } else {
      this.toasterService.error(
        "All fields are required!",
        "Assignment creation failed!"
      );
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
