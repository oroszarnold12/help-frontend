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
import { Announcement } from "src/app/model/announcement.model";
import { CourseService } from "src/app/shared/course.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-announcement-form",
  templateUrl: "./announcement-form.component.html",
  styleUrls: ["./announcement-form.component.scss"],
})
export class AnnouncementFormComponent implements OnInit, OnDestroy {
  private stop: Subject<void> = new Subject();

  announcementForm: FormGroup;
  newAnnouncement: Announcement;

  @Input() courseId: number;
  @Input() announcement: Announcement;

  editorMaxLength: number;
  editorStyle: any;
  editorConfig: any;

  constructor(
    private modalController: ModalController,
    private toasterService: ToasterService,
    private courseService: CourseService
  ) {
    this.editorMaxLength = 16384;

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
    this.announcementForm = this.createFormGroup();

    if (!!this.announcement) {
      this.announcementForm.patchValue(this.announcement);
    }
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  createFormGroup(): FormGroup {
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

  dismissModal(): void {
    this.modalController.dismiss();
  }

  get errorControl(): {
    [key: string]: AbstractControl;
  } {
    return this.announcementForm.controls;
  }

  submitForm(): void {
    if (this.announcementForm.valid) {
      if (!!this.announcement) {
        this.newAnnouncement = this.announcementForm.value;

        this.courseService
          .updateAnnouncement(
            this.newAnnouncement,
            this.courseId,
            this.announcement.id
          )
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
              this.announcementForm.reset();

              this.toasterService.success(
                "Congratulations!",
                "Announcement updated!"
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
        this.newAnnouncement = this.announcementForm.value;

        this.courseService
          .saveAnnouncement(this.newAnnouncement, this.courseId)
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
              this.announcementForm.reset();

              this.toasterService.success(
                "Congratulations!",
                "Announcement created!"
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
        "Announcement creation failed!"
      );
    }
  }
}
