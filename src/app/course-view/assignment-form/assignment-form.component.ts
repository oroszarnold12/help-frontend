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
import { Assignment } from 'src/app/model/assignment.model';
import { CourseService } from 'src/app/shared/course.service';
import { ToasterService } from 'src/app/shared/toaster.service';

@Component({
  selector: 'app-assignment-form',
  templateUrl: './assignment-form.component.html',
  styleUrls: ['./assignment-form.component.scss'],
})
export class AssignmentFormComponent implements OnInit, OnDestroy {
  private stop: Subject<void> = new Subject();

  assignmentFrom: FormGroup;
  newAssignment: Assignment;

  @Input() courseId: number;
  @Input() assignment: Assignment;

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
    this.assignmentFrom = this.createFormGroup();

    if (!!this.assignment) {
      this.assignmentFrom.patchValue(this.assignment);
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
      dueDate: new FormControl('', Validators.required),
      points: new FormControl('', [Validators.required, Validators.min(0)]),
      description: new FormControl('', [
        Validators.required,
        Validators.maxLength(this.editorMaxLength),
      ]),
      published: new FormControl(false),
    });
  }

  dismissModal(): void {
    this.modalController.dismiss();
  }

  get errorControl(): {
    [key: string]: AbstractControl;
  } {
    return this.assignmentFrom.controls;
  }

  submitForm(): void {
    if (this.assignmentFrom.valid) {
      if (!!this.assignment) {
        this.newAssignment = this.assignmentFrom.value;

        this.courseService
          .updateAssignment(
            this.newAssignment,
            this.courseId,
            this.assignment.id
          )
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
              this.assignmentFrom.reset();

              this.toasterService.success(
                'Congratulations!',
                'Assignment updated!'
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
        this.newAssignment = this.assignmentFrom.value;

        this.courseService
          .saveAssignment(this.newAssignment, this.courseId)
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
              this.assignmentFrom.reset();

              this.toasterService.success(
                'Congratulations!',
                'Assignment created!'
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
        'Assignment creation failed!'
      );
    }
  }
}
