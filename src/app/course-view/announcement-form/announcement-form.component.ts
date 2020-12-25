import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Annoucement } from "src/app/model/announcement.model";
import { Course } from "src/app/model/course.model";
import { CourseService } from "src/app/shared/course.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-announcement-form",
  templateUrl: "./announcement-form.component.html",
  styleUrls: ["./announcement-form.component.scss"],
})
export class AnnouncementFormComponent implements OnInit {
  announcementForm: FormGroup;
  newAnnouncement: Annoucement;
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
    this.announcementForm = this.createFormGroup();
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
    return this.announcementForm.controls;
  }

  submitForm() {
    if (this.announcementForm.valid) {
      this.newAnnouncement = this.announcementForm.value;
      this.newAnnouncement.date = new Date().toISOString();
      this.course.announcements.push(this.newAnnouncement);
      this.courseService
        .updateCourse(this.course, this.course.id)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (course) => {
            this.announcementForm.reset();
            this.toasterService.success(
              "Congratulations!",
              "Announcement created!"
            );
          },
          (error) => {
            this.toasterService.error("Something went wrong!", error.error);
          }
        );
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
