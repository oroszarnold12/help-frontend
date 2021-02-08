import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AnnouncementComment } from "src/app/model/announcement-comment.model";
import { CommentService } from "src/app/shared/comment.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-announcement-comment-form",
  templateUrl: "./announcement-comment-form.component.html",
  styleUrls: ["./announcement-comment-form.component.scss"],
})
export class AnnouncementCommentFormComponent implements OnInit {
  commentForm: FormGroup;
  commentCreation: AnnouncementComment;
  @Input() comment: AnnouncementComment;
  @Input() courseId: number;
  @Input() announcementId: number;
  private stop: Subject<void> = new Subject();

  editorMaxLength = 2048;
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
    private commentService: CommentService
  ) {}

  ngOnInit() {
    this.commentForm = this.createFormGroup();
    if (!!this.comment) {
      this.commentForm.patchValue(this.comment);
    }
  }

  createFormGroup() {
    return new FormGroup({
      content: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.editorMaxLength),
      ]),
    });
  }

  submitForm() {
    if (this.commentForm.valid) {
      if (!!this.comment) {
        this.commentCreation = this.commentForm.value;
        this.commentService
          .updateAnnouncementComment(
            this.courseId,
            this.announcementId,
            this.comment.id,
            this.commentCreation
          )
          .pipe(takeUntil(this.stop))
          .subscribe(
            (comment) => {
              this.commentForm.reset();
              this.toasterService.success(
                "Congratulations!",
                "Comment updated!"
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
        this.commentCreation = this.commentForm.value;
        this.commentService
          .saveAnnouncementComment(
            this.courseId,
            this.announcementId,
            this.commentCreation
          )
          .pipe(takeUntil(this.stop))
          .subscribe(
            (comment) => {
              this.commentForm.reset();
              this.toasterService.success(
                "Congratulations!",
                "Comment created!"
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
        "Comment creation failed!"
      );
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  get errorControl() {
    return this.commentForm.controls;
  }

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
