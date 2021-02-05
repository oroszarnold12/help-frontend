import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
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
export class AnnouncementFormComponent implements OnInit {
  announcementForm: FormGroup;
  newAnnouncement: Announcement;
  @Input() courseId: number;
  @Input() announcement: Announcement;
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
    this.announcementForm = this.createFormGroup();
    if (!!this.announcement) {
      this.announcementForm.patchValue(this.announcement);
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
    return this.announcementForm.controls;
  }

  submitForm() {
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
            (announcement) => {
              this.announcementForm.reset();
              this.toasterService.success(
                "Congratulations!",
                "Announcement updated!"
              );
              this.modalController.dismiss();
            },
            (error) => {
              console.log(error);
              this.toasterService.error(error.error, "Please try again!");
            }
          );
      } else {
        this.newAnnouncement = this.announcementForm.value;
        this.courseService
          .saveAnnouncement(this.newAnnouncement, this.courseId)
          .pipe(takeUntil(this.stop))
          .subscribe(
            (announcement) => {
              this.announcementForm.reset();
              this.toasterService.success(
                "Congratulations!",
                "Announcement created!"
              );
              this.modalController.dismiss();
            },
            (error) => {
              console.log(error);
              this.toasterService.error(error.error, "Please try again!");
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

  ngOnDestroy() {
    this.stop.next();
    this.stop.complete();
  }
}
