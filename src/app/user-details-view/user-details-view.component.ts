import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AlertController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Person } from "../model/person.model";
import { url } from "../shared/api-config";
import { BackButtonService } from "../shared/back-button.service";
import { passwordMatchValidator } from "../shared/passwordUtils";
import { PathService } from "../shared/path.service";
import { PersonService } from "../shared/person.service";
import { ToasterService } from "../shared/toaster.service";

@Component({
  selector: "app-user-details-view",
  templateUrl: "./user-details-view.component.html",
  styleUrls: ["./user-details-view.component.scss"],
})
export class UserDetailsViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();
  user: Person;
  passwordForm: FormGroup;
  changignPassword: boolean;
  changingImage: boolean;
  imageUrl: string = this.getImageUrl();
  private image;

  constructor(
    private backButtonService: BackButtonService,
    private personService: PersonService,
    private toasterService: ToasterService,
    private pathService: PathService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.backButtonService.turnOn();
    this.pathService.setPath("Account settings");
    this.changignPassword = false;
    this.changingImage = false;

    this.loadUser();

    this.passwordForm = this.createFormGroup();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadUser() {
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
            "Something went wrong!"
          );
        }
      );
  }

  createFormGroup() {
    return new FormGroup(
      {
        password: new FormControl("", [
          Validators.required,
          Validators.maxLength(255),
          Validators.minLength(8),
          Validators.pattern(".*[0-9].*"),
          Validators.pattern(".*[a-z].*"),
          Validators.pattern(".*[A-Z].*"),
          Validators.pattern(".*[^A-Za-z0-9].*"),
        ]),
        confirmPassword: new FormControl("", [Validators.required]),
      },
      {
        validators: passwordMatchValidator,
      }
    );
  }

  get errorControl() {
    return this.passwordForm.controls;
  }

  getRoleString(role: string): string {
    return role.replace("ROLE_", "");
  }

  submitForm() {
    const passowrds = this.passwordForm.value;

    if (passowrds.password === passowrds.confirmPassword) {
      this.personService
        .changePassword(passowrds.password)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (user) => {
            this.toasterService.success(
              "Password changed successfuly!",
              "Congratulations!"
            );
            this.changignPassword = false;
            this.passwordForm.reset();
          },
          (error) => {
            this.toasterService.error(error.error.message, "Please try again!");
          }
        );
    } else {
      this.toasterService.error("Passwords don't match!", "Please try again!");
    }
  }

  onChangePasswordClicked() {
    this.changignPassword = true;
  }

  onCancelClicked() {
    this.changignPassword = false;
    this.passwordForm.reset();
  }

  onChangeImageClicked() {
    this.changingImage = true;
  }

  onImageCancelClicked() {
    this.changingImage = false;
    this.image = null;
  }

  onFileChange(fileChangeEvent) {
    this.image = fileChangeEvent.target.files[0];
  }

  uploadFile() {
    const formData = new FormData();
    formData.append("image", this.image);
    if (!!this.image) {
      this.personService
        .saveImage(formData)
        .pipe(takeUntil(this.stop))
        .subscribe(
          (person) => {
            this.toasterService.success(
              "Image uploaded successfully!",
              "Congratulations!"
            );
            this.changingImage = false;
            this.image = null;
            this.imageUrl = this.getImageUrl();
          },
          (error) => {
            this.toasterService.error(error.error.message, "Please try again!");
          }
        );
    } else {
      this.toasterService.error("Image is required!", "Please try again!");
    }
  }

  async onRemoveClicked() {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this image?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.personService
              .removeImage()
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Image removed successfuly!",
                    "Congratulations!"
                  );
                  this.imageUrl = this.getImageUrl();
                },
                (error) => {
                  this.toasterService.error(
                    error.error.message,
                    "Please try again!"
                  );
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  getImageUrl() {
    const newUrl = url + "/user/image" + "?" + new Date().getTime();
    this.personService.setImageUrl(newUrl);
    return newUrl;
  }
}
