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
      content: new FormControl("", Validators.required),
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
        .subscribe((course) => {
          this.announcementForm.reset();
          this.toasterService.success(
            "Congratulations!",
            "Announcement created!"
          );
        });
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
