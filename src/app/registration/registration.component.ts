import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PersonSignup } from "../model/person-signup.model";
import { AuthService } from "../shared/auth.service";
import { BackButtonService } from "../shared/back-button.service";
import { passwordMatchValidator } from "../shared/passwordUtils";
import { ToasterService } from "../shared/toaster.service";

@Component({
  selector: "app-registration",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.scss"],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  personSignup: PersonSignup;

  constructor(
    private authService: AuthService,
    private toasterService: ToasterService,
    private backButtonService: BackButtonService
  ) {}

  ngOnInit() {
    this.registrationForm = this.createFormGroup();
    this.backButtonService.turnOn();
  }

  ngOnDestroy(): void {
    this.backButtonService.turnOff();
  }

  createFormGroup() {
    return new FormGroup(
      {
        firstName: new FormControl("", [
          Validators.required,
          Validators.maxLength(255),
        ]),
        lastName: new FormControl("", [
          Validators.required,
          Validators.maxLength(255),
        ]),
        email: new FormControl("", [
          Validators.required,
          Validators.maxLength(255),
          Validators.pattern("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"),
        ]),
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
    return this.registrationForm.controls;
  }

  submitForm() {
    if (this.registrationForm.valid) {
      this.personSignup = this.registrationForm.value;
      this.authService.register(this.personSignup).subscribe(
        (person) => {
          this.registrationForm.reset();
          this.toasterService.success(
            "Congratulations!",
            "Registration successful!"
          );
        },
        (error) => {
          this.toasterService.error(error.error, "Please try again!");
        }
      );
    } else {
      this.toasterService.error(
        "All fields are required!",
        "Registration failed!"
      );
    }
  }
}
