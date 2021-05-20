import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SERVER_URL } from 'src/environments/environment';
import { Person } from '../model/person.model';
import { BackButtonService } from '../shared/back-button.service';
import { passwordMatchValidator } from '../shared/passwordUtils';
import { PersonService } from '../shared/person.service';
import { ToasterService } from '../shared/toaster.service';

@Component({
  selector: 'app-user-details-view',
  templateUrl: './user-details-view.component.html',
  styleUrls: ['./user-details-view.component.scss'],
})
export class UserDetailsViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();
  user: Person;

  passwordForm: FormGroup;
  changignPassword: boolean;

  changingImage: boolean;
  imageUrl: string;

  private image;

  constructor(
    private backButtonService: BackButtonService,
    private personService: PersonService,
    private toasterService: ToasterService,
    private alertController: AlertController
  ) {
    this.imageUrl = this.getImageUrl();
  }

  ngOnInit(): void {
    this.backButtonService.turnOn();
    this.changignPassword = false;
    this.changingImage = false;

    this.loadUser();

    this.passwordForm = this.createFormGroup();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadUser(): void {
    this.personService
      .getCurrentUser()
      .pipe(takeUntil(this.stop))
      .subscribe(
        (user) => {
          this.user = user;
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            'Something went wrong!'
          );
        }
      );
  }

  createFormGroup(): FormGroup {
    return new FormGroup(
      {
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

  get errorControl(): { [key: string]: AbstractControl } {
    return this.passwordForm.controls;
  }

  getRoleString(role: string): string {
    return role.replace('ROLE_', '');
  }

  submitForm(): void {
    const passowrds = this.passwordForm.value;

    if (passowrds.password === passowrds.confirmPassword) {
      this.personService
        .changePassword(passowrds.password)
        .pipe(takeUntil(this.stop))
        .subscribe(
          () => {
            this.toasterService.success(
              'Password changed successfuly!',
              'Congratulations!'
            );
            this.changignPassword = false;
            this.passwordForm.reset();
          },
          (error) => {
            this.toasterService.error(error.error.message, 'Please try again!');
          }
        );
    } else {
      this.toasterService.error('Passwords do not match!', 'Please try again!');
    }
  }

  onChangePasswordClicked(): void {
    this.changignPassword = true;
  }

  onCancelClicked(): void {
    this.changignPassword = false;
    this.passwordForm.reset();
  }

  onChangeImageClicked(): void {
    this.changingImage = true;
  }

  onImageCancelClicked(): void {
    this.changingImage = false;
    this.image = null;
  }

  onFileChange(fileChangeEvent): void {
    this.image = fileChangeEvent.target.files[0];
  }

  uploadFile(): void {
    const formData = new FormData();
    formData.append('image', this.image);

    if (!!this.image) {
      this.personService
        .saveImage(formData)
        .pipe(takeUntil(this.stop))
        .subscribe(
          () => {
            this.toasterService.success(
              'Image uploaded successfully!',
              'Congratulations!'
            );

            this.changingImage = false;
            this.image = null;
            this.imageUrl = this.getImageUrl();
          },
          (error) => {
            this.toasterService.error(error.error.message, 'Please try again!');
          }
        );
    } else {
      this.toasterService.error('Image is required!', 'Please try again!');
    }
  }

  async onRemoveClicked(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure that you want to delete this image?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: () => {
            this.personService
              .removeImage()
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    'Image removed successfuly!',
                    'Congratulations!'
                  );

                  this.imageUrl = this.getImageUrl();
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    'Please try again!'
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  getImageUrl(): string {
    const newUrl = SERVER_URL + '/user/image' + '?' + new Date().getTime();
    this.personService.setImageUrl(newUrl);
    return newUrl;
  }

  onNotificationsSettingsChanged(event: CustomEvent): void {
    this.personService
      .changeNotificationSettings(event.detail.checked)
      .pipe(takeUntil(this.stop))
      .subscribe(
        () => {
          this.toasterService.success(
            'Notifications are turned ' +
              (event.detail.checked ? 'on!' : 'off!'),
            'Congratualtions!'
          );
        },
        (error) => {
          this.loadUser();
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }
}
