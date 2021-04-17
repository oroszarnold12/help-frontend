import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { DiscussionComment } from "src/app/model/discussion-comment.model";
import { CommentService } from "src/app/shared/comment.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-discussion-comment-form",
  templateUrl: "./discussion-comment-form.component.html",
  styleUrls: ["./discussion-comment-form.component.scss"],
})
export class DiscussionCommentFormComponent implements OnInit, OnDestroy {
  private stop: Subject<void> = new Subject();

  commentForm: FormGroup;
  commentCreation: DiscussionComment;

  @Input() comment: DiscussionComment;
  @Input() courseId: number;
  @Input() discussionId: number;

  editorMaxLength: number;
  editorStyle: any;
  editorConfig: any;

  constructor(
    private modalController: ModalController,
    private toasterService: ToasterService,
    private commentService: CommentService
  ) {
    this.editorMaxLength = 2048;
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
    this.commentForm = this.createFormGroup();

    if (!!this.comment) {
      this.commentForm.patchValue(this.comment);
    }
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      content: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.editorMaxLength),
      ]),
    });
  }

  submitForm(): void {
    if (this.commentForm.valid) {
      if (!!this.comment) {
        this.commentCreation = this.commentForm.value;

        this.commentService
          .updateDiscussionComment(
            this.courseId,
            this.discussionId,
            this.comment.id,
            this.commentCreation
          )
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
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
          .saveDiscussionComment(
            this.courseId,
            this.discussionId,
            this.commentCreation
          )
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
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

  dismissModal(): void {
    this.modalController.dismiss();
  }

  get errorControl(): {
    [key: string]: AbstractControl;
  } {
    return this.commentForm.controls;
  }
}
