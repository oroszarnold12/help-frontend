import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { PersonSignup } from '../../model/person-signup.model';
import { passwordMatchValidator } from '../../shared/passwordUtils';
import { ToasterService } from '../../shared/toaster.service';
import { Role } from '../../model/role.enum';
import { PersonService } from 'src/app/shared/person.service';
import { takeUntil } from 'rxjs/operators';
import { Person } from 'src/app/model/person.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  private stop: Subject<void> = new Subject();

  registrationForm: FormGroup;
  personSignup: PersonSignup;

  Role = Role;

  @Input() person: Person;

  constructor(
    private personService: PersonService,
    private toasterService: ToasterService,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.registrationForm = this.createFormGroup();

    if (!!this.person) {
      this.registrationForm.patchValue(this.person);

      this.registrationForm.removeControl('email');
      this.registrationForm.removeControl('password');
      this.registrationForm.removeControl('confirmPassword');
    }
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  createFormGroup(): FormGroup {
    return new FormGroup(
      {
        firstName: new FormControl('', [
          Validators.required,
          Validators.maxLength(255),
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.maxLength(255),
        ]),
        personGroup: new FormControl('', [
          Validators.required,
          Validators.maxLength(255),
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.maxLength(255),
          Validators.pattern('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'),
        ]),
        role: new FormControl(''),
        password: new FormControl('', [
          Validators.required,
          Validators.maxLength(255),
          Validators.minLength(8),
          Validators.pattern('.*[0-9].*'),
          Validators.pattern('.*[a-z].*'),
          Validators.pattern('.*[A-Z].*'),
          Validators.pattern('.*[^A-Za-z0-9].*'),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      {
        validators: passwordMatchValidator,
      }
    );
  }

  get errorControl(): {
    [key: string]: AbstractControl;
  } {
    return this.registrationForm.controls;
  }

  submitForm(): void {
    if (this.registrationForm.valid) {
      if (!!this.person) {
        this.personService
          .updatePerson(this.registrationForm.value, this.person.id)
          .pipe(takeUntil(this.stop))
          .subscribe(
            () => {
              this.toasterService.success(
                'Person update successful!',
                'Congratulations!'
              );

              this.dismissModal();
            },
            (error) => {
              this.toasterService.error(
                error.error.message,
                'Please try again!'
              );
            }
          );
      } else {
        this.personSignup = this.registrationForm.value;

        this.personService.savePerson([this.personSignup]).subscribe(
          () => {
            this.registrationForm.reset();
            this.toasterService.success(
              'Congratulations!',
              'Registration successful!'
            );
          },
          (error) => {
            this.toasterService.error(error.error.message, 'Please try again!');
          }
        );
      }
    } else {
      this.toasterService.error(
        'All fields are required!',
        'Registration failed!'
      );
    }
  }

  dismissModal(): void {
    this.modalController.dismiss();
  }
}
