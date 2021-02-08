import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
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
  @Input() courseId: number;
  @Input() discussion: Discussion;
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
    if (!!this.discussion) {
      this.discussionFrom.patchValue(this.discussion);
    }
  }

  createFormGroup() {
    return new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.maxLength(255),
      ]),
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
      if (!!this.discussion) {
        this.newDiscussion = this.discussionFrom.value;
        this.courseService
          .updateDiscussion(
            this.newDiscussion,
            this.courseId,
            this.discussion.id
          )
          .pipe(takeUntil(this.stop))
          .subscribe(
            (discussion) => {
              this.discussionFrom.reset();
              this.toasterService.success(
                "Congratulations!",
                "Discussion updated!"
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
        this.newDiscussion = this.discussionFrom.value;
        this.courseService
          .saveDiscussion(this.newDiscussion, this.courseId)
          .pipe(takeUntil(this.stop))
          .subscribe(
            (discussion) => {
              this.discussionFrom.reset();
              this.toasterService.success(
                "Congratulations!",
                "Discussion created!"
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
        "Discussion creation failed!"
      );
    }
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
