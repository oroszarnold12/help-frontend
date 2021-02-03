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
      },
      delete: {
        confirmDelete: true,
      },
      edit: {
        confirmSave: true,
      },
      columns: {
        name: {
          title: "Name",
          editable: false,
          valuePrepareFunction: (cell, row) => {
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

  ngOnInit() {
    this.loadPersons();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadPersons() {
    this.personService
      .getPersonsForAdmin()
      .pipe(takeUntil(this.stop))
      .subscribe(({ persons }) => {
        this.persons = persons.filter((person) => person.role !== Role.ADMIN);
      });
  }

  async onDeleteConfirm(event) {
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
                  this.toasterService.error(error.error, "Please try again!");
                }
              );
          },
        },
      ],
    });

    await alert.present();
  }

  onEditConfirm(event) {
    this.personService
      .updatePerson(event.newData, event.newData.id)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (person) => {
          this.toasterService.success(
            "Person update successful!",
            "Congratulations!"
          );
          event.confirm.resolve();
        },
        (error) => {
          this.toasterService.error(error.error, "Please try again!");
        }
      );
  }
}
