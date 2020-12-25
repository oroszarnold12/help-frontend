import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Course } from "src/app/model/course.model";
import { Discussion } from "src/app/model/discussion.model";
import { CourseService } from "src/app/shared/course.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-discussion-form",
  templateUrl: "./discussion-form.component.html",
  styleUrls: ["./discussion-form.component.scss"],
})
export class DiscussionFormComponent implements OnInit {
  discussionFrom: FormGroup;
  newDiscussion: Discussion;
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
    this.discussionFrom = this.createFormGroup();
  }

  createFormGroup() {
    return new FormGroup({
      name: new FormControl("", Validators.required),
      content: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.editorMaxLength),
      ]),
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  get errorControl() {
    return this.discussionFrom.controls;
  }

  submitForm() {
    if (this.discussionFrom.valid) {
      this.newDiscussion = this.discussionFrom.value;
      this.newDiscussion.date = new Date().toISOString();
      this.newDiscussion.comments = [];
      this.course.discussions.push(this.newDiscussion);
      this.courseService
        .updateCourse(this.course, this.course.id)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (course) => {
            this.discussionFrom.reset();
            this.toasterService.success(
              "Congratulations!",
              "Discussion created!"
            );
          },
          (error) => {
            this.toasterService.error("Something went wrong!", error.error);
          }
        );
    } else {
      this.toasterService.error(
        "All fields are required!",
        "Discussion creation failed!"
      );
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
