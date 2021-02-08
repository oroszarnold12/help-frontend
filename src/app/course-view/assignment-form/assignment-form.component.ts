import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Assignment } from "src/app/model/assignment.model";
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
  @Input() courseId: number;
  @Input() assignment: Assignment;
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
    if (!!this.assignment) {
      this.assignmentFrom.patchValue(this.assignment);
    }
  }

  createFormGroup() {
    return new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.maxLength(255),
      ]),
      dueDate: new FormControl("", Validators.required),
      points: new FormControl("", [Validators.required, Validators.min(0)]),
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
      if (!!this.assignment) {
        this.newAssignment = this.assignmentFrom.value;
        this.courseService
          .updateAssignment(
            this.newAssignment,
            this.courseId,
            this.assignment.id
          )
          .pipe(takeUntil(this.stop))
          .subscribe(
            (assignment) => {
              this.assignmentFrom.reset();
              this.toasterService.success(
                "Congratulations!",
                "Assignment updated!"
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
        this.newAssignment = this.assignmentFrom.value;
        this.courseService
          .saveAssignment(this.newAssignment, this.courseId)
          .pipe(takeUntil(this.stop))
          .subscribe(
            (assignment) => {
              this.assignmentFrom.reset();
              this.toasterService.success(
                "Congratulations!",
                "Assignment created!"
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
        "Assignment creation failed!"
      );
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
