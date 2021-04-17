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
import { AnnouncementComment } from "src/app/model/announcement-comment.model";
import { CommentService } from "src/app/shared/comment.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-announcement-comment-form",
  templateUrl: "./announcement-comment-form.component.html",
  styleUrls: ["./announcement-comment-form.component.scss"],
})
export class AnnouncementCommentFormComponent implements OnInit, OnDestroy {
  private stop: Subject<void> = new Subject();

  commentForm: FormGroup;
  commentCreation: AnnouncementComment;

  @Input() comment: AnnouncementComment;
  @Input() courseId: number;
  @Input() announcementId: number;

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
          .updateAnnouncementComment(
            this.courseId,
            this.announcementId,
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
          .saveAnnouncementComment(
            this.courseId,
            this.announcementId,
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
