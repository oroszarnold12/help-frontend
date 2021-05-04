import { Component, OnDestroy, OnInit } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Person } from "../model/person.model";
import { Role } from "../model/role.enum";
import { PersonService } from "../shared/person.service";
import { ToasterService } from "../shared/toaster.service";

@Component({
  selector: "app-admin-view",
  templateUrl: "./admin-view.component.html",
  styleUrls: ["./admin-view.component.scss"],
})
export class AdminViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();

  persons: Person[];
  filteredPersons: Person[];
  personsSettings: any;

  constructor(
    private personService: PersonService,
    private alertController: AlertController,
    private toasterService: ToasterService
  ) {
    this.personsSettings = {
      actions: {
        add: false,
        edit: true,
        delete: true,
        columnTitle: "",
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
          title: "Name",
          editable: false,
          filter: false,
          valuePrepareFunction: (_cell, row) => {
            return row.firstName + " " + row.lastName;
          },
        },
        role: {
          title: "Role",
          filter: false,
          editor: {
            type: "list",
            config: {
              list: [
                { value: "ROLE_TEACHER", title: "ROLE_TEACHER" },
                { value: "ROLE_STUDENT", title: "ROLE_STUDENT" },
              ],
            },
          },
        },
      },
    };
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
            "Could not load persons!",
            "Something went wrong!"
          );
        }
      );
  }

  async onDeleteConfirm(event: any): Promise<void> {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this user?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.personService
              .deletePerson(event.data.id)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Person deletion successful!",
                    "Congratulations!"
                  );

                  event.confirm.resolve();
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

  onEditConfirm(event: any): void {
    this.personService
      .updatePerson(event.newData, event.newData.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        () => {
          this.toasterService.success(
            "Person update successful!",
            "Congratulations!"
          );

          event.confirm.resolve();
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  onFilterPersons(event: CustomEvent): void {
    if (event.detail.value !== "") {
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
}
