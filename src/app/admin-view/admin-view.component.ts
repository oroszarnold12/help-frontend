import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { NgxCsvParser } from 'ngx-csv-parser';
import { FileSaverService } from 'ngx-filesaver';
import { generate, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PersonSignup } from '../model/person-signup.model';
import { Person } from '../model/person.model';
import { Role } from '../model/role.enum';
import { PersonService } from '../shared/person.service';
import { ToasterService } from '../shared/toaster.service';
import { RegistrationComponent } from './registration/registration.component';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.scss'],
})
export class AdminViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();

  persons: Person[];
  filteredPersons: Person[];
  personsSettings: any;

  file: File;

  showErrorMessage: boolean;
  errorMessage: string;

  lowerCase: string = 'abcdefghijklmnopqrstuvwxyz';
  upperCase: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  numbers: string = '0123456789';
  symbols: string = '!@#$%^&*_-+=';

  constructor(
    private personService: PersonService,
    private alertController: AlertController,
    private toasterService: ToasterService,
    private modalController: ModalController,
    private ngxCsvParser: NgxCsvParser,
    private fileSaverService: FileSaverService
  ) {
    this.personsSettings = {
      actions: {
        add: false,
        edit: true,
        delete: true,
        columnTitle: '',
      },
      delete: {
        confirmDelete: true,
        deleteButtonContent: '<i class="bi bi-trash"></i>',
      },
      edit: {
        confirmSave: true,
        saveButtonContent: '<i class="bi bi-check2"></i>',
        cancelButtonContent: '<i class="bi bi-x"></i>',
        editButtonContent: '<i class="bi bi-pencil-square"></i>',
      },
      columns: {
        name: {
          title: 'Name',
          editable: false,
          filter: false,
          valuePrepareFunction: (cell, row) => {
            return row.firstName + ' ' + row.lastName;
          },
        },
        personGroup: {
          title: 'Group',
          filter: false,
          name: 'personGroup',
        },
        role: {
          title: 'Role',
          filter: false,
          editor: {
            type: 'list',
            config: {
              list: [
                { value: 'ROLE_TEACHER', title: 'TEACHER' },
                { value: 'ROLE_STUDENT', title: 'STUDENT' },
              ],
            },
          },
          valuePrepareFunction: (cell) => {
            return String(cell).substring(String(cell).indexOf('_') + 1);
          },
        },
      },
    };

    this.showErrorMessage = false;
    this.errorMessage = '';
  }

  ngOnInit(): void {
    this.loadPersons();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadPersons(): void {
    this.personService
      .getPersonsForAdmin()
      .pipe(takeUntil(this.stop))
      .subscribe(
        ({ persons }) => {
          this.persons = persons.filter((person) => person.role !== Role.ADMIN);
          this.filteredPersons = this.persons;
        },
        () => {
          this.toasterService.error(
            'Could not load persons!',
            'Something went wrong!'
          );
        }
      );
  }

  async onDeleteConfirm(event: any): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: 'Are you sure that you want to delete this user?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes',
          handler: () => {
            this.personService
              .deletePerson(event.data.id)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    'Person deletion successful!',
                    'Congratulations!'
                  );

                  event.confirm.resolve();
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

  onEditConfirm(event: any): void {
    this.personService
      .updatePerson(event.newData, event.newData.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        () => {
          this.toasterService.success(
            'Person update successful!',
            'Congratulations!'
          );

          event.confirm.resolve();
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }

  onFilterPersons(event: CustomEvent): void {
    if (event.detail.value !== '') {
      this.filteredPersons = this.persons.filter((person) => {
        return (
          person.firstName
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase()) ||
          person.lastName
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase())
        );
      });
    } else {
      this.filteredPersons = this.persons;
    }
  }

  async presentRegistrationModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: RegistrationComponent,
      cssClass: 'my-custom-modal-css',
    });

    modal.onDidDismiss().then(() => this.loadPersons());

    await modal.present();
  }

  onFileChange(fileChangeEvent): void {
    this.file = fileChangeEvent.target.files[0];
  }

  onRegisterWithFileClicked(): void {
    this.ngxCsvParser
      .parse(this.file, { header: true, delimiter: ',' })
      .pipe(takeUntil(this.stop))
      .subscribe(
        (results: any[]) => {
          const personsToRegister: PersonSignup[] = [];
          results.forEach((result) => {
            result.password = this.generatePassword();
            personsToRegister.push(result as PersonSignup);
          });

          this.personService
            .savePerson(personsToRegister)
            .pipe(takeUntil(this.stop))
            .subscribe(
              () => {
                let registeredUsers: string =
                  '   Name               Email           Password\n';

                personsToRegister.forEach((person) => {
                  registeredUsers +=
                    person.firstName +
                    ' ' +
                    person.lastName +
                    ' - ' +
                    person.email +
                    ' - ' +
                    person.password +
                    '\n';
                });

                this.fileSaverService.save(
                  new Blob([registeredUsers]),
                  'registeredUsers.txt'
                );

                this.showErrorMessage = false;
                this.errorMessage = '';

                this.file = null;

                this.loadPersons();

                this.toasterService.success(
                  'Persons registered successfully!',
                  'Congratulations!'
                );
              },
              (error) => {
                this.errorMessage = error.error.message;
                this.showErrorMessage = true;
              }
            );
        },
        (error) => {
          this.toasterService.error(error.message, 'Please try again!');
        }
      );
  }

  generatePassword(): string {
    let password = '';

    password += this.upperCase.charAt(
      Math.floor(Math.random() * this.upperCase.length)
    );
    password += this.lowerCase.charAt(
      Math.floor(Math.random() * this.lowerCase.length)
    );
    password += this.numbers.charAt(
      Math.floor(Math.random() * this.numbers.length)
    );
    password += this.symbols.charAt(
      Math.floor(Math.random() * this.symbols.length)
    );

    for (let i = 0; i < 8; i++) {
      let type = Math.floor(Math.random() * 4);

      switch (type) {
        case 0: {
          password += this.upperCase.charAt(
            Math.floor(Math.random() * this.upperCase.length)
          );
          break;
        }
        case 1: {
          password += this.lowerCase.charAt(
            Math.floor(Math.random() * this.lowerCase.length)
          );
          break;
        }
        case 2: {
          password += this.numbers.charAt(
            Math.floor(Math.random() * this.numbers.length)
          );
          break;
        }
        case 3: {
          password += this.symbols.charAt(
            Math.floor(Math.random() * this.symbols.length)
          );
          break;
        }
      }
    }

    return password;
  }
}
