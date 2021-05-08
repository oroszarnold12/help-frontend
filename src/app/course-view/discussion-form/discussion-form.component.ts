import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Discussion } from 'src/app/model/discussion.model';
import { CourseService } from 'src/app/shared/course.service';
import { ToasterService } from 'src/app/shared/toaster.service';

@Component({
  selector: 'app-discussion-form',
  templateUrl: './discussion-form.component.html',
  styleUrls: ['./discussion-form.component.scss'],
})
export class DiscussionFormComponent implements OnInit, OnDestroy {
  private stop: Subject<void> = new Subject();

  discussionFrom: FormGroup;
  newDiscussion: Discussion;

  @Input() courseId: number;
  @Input() discussion: Discussion;

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
      height: '300px',
    };
    this.editorConfig = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],

        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],

        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],

        ['link'],
      ],
    };
  }

  ngOnInit(): void {
    this.discussionFrom = this.createFormGroup();

    if (!!this.discussion) {
      this.discussionFrom.patchValue(this.discussion);
    }
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(255),
      ]),
      content: new FormControl('', [
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
    return this.discussionFrom.controls;
  }

  submitForm(): void {
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
            () => {
              this.discussionFrom.reset();

              this.toasterService.success(
                'Congratulations!',
                'Discussion updated!'
              );

              this.modalController.dismiss();
            },
            (error) => {
              this.toasterService.error(
                error.error.message,
                'Please try again!'
              );
            }
          );
      } else {
        this.newDiscussion = this.discussionFrom.value;

        this.courseService
          .saveDiscussion(this.newDiscussion, this.courseId)
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
              this.discussionFrom.reset();

              this.toasterService.success(
                'Congratulations!',
                'Discussion created!'
              );

              this.modalController.dismiss();
            },
            (error) => {
              this.toasterService.error(
                error.error.message,
                'Please try again!'
              );
            }
          );
      }
    } else {
      this.toasterService.error(
        'All fields are required!',
        'Discussion creation failed!'
      );
    }
  }
}
