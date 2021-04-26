import { Component, Input, OnInit } from "@angular/core";
import { AlertController, ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Conversation } from "src/app/model/conversation.model";
import { ConversationService } from "src/app/shared/conversation.service";
import { PersonService } from "src/app/shared/person.service";
import { ToasterService } from "src/app/shared/toaster.service";

@Component({
  selector: "app-participant-view",
  templateUrl: "./participant-view.component.html",
  styleUrls: ["./participant-view.component.scss"],
})
export class ParticipantViewComponent implements OnInit {
  private stop: Subject<void> = new Subject();

  @Input() conversation: Conversation;

  persons: any[];
  personsToInvite: any[];

  addingPersons: boolean;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private conversationService: ConversationService,
    private toasterService: ToasterService,
    private personService: PersonService
  ) {
    this.personsToInvite = [];
    this.addingPersons = false;
  }

  ngOnInit(): void {
    this.loadPersons();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  dismissModal(): void {
    this.modalController.dismiss();
  }

  loadConversation(conversationId: number): void {
    this.conversationService
      .getConversation(conversationId)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (conversation) => {
          this.conversation = conversation;
        },
        () => {
          this.toasterService.error(
            "Could not get conversation!",
            "Something went wrong!"
          );
        }
      );
  }

  loadPersons(): void {
    this.personService
      .getPersons()
      .pipe(takeUntil(this.stop))
      .subscribe(
        (data) => {
          this.persons = data.persons;

          this.persons.forEach((person) => {
            person.fullName = person.firstName + " " + person.lastName;
          });

          this.filterParticipantsFromPersons();
        },
        () => {
          this.toasterService.error(
            "Could not load persons!",
            "Something went wrong!"
          );
        }
      );
  }

  filterParticipantsFromPersons(): void {
    this.persons = this.persons.filter(
      (person) =>
        this.conversation.participants.findIndex(
          (person1) => person1.id === person.id
        ) === -1
    );
  }

  async onKickParticipantClicked(participantId: number): Promise<void> {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to kick this person?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.conversationService
              .kickConversationParticipant(this.conversation.id, participantId)
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Participant kicked successfully!",
                    "Congratulations!"
                  );

                  this.loadConversation(this.conversation.id);
                  this.loadPersons();
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

  onAddPersonsClicked(): void {
    this.addingPersons = true;
  }

  onCancelClicked(): void {
    this.addingPersons = false;

    this.personsToInvite = [];
  }

  onAddPersonsClickedSecondTime(): void {
    let emails: string[] = this.personsToInvite.map((person) => person.email);

    this.conversationService
      .addConversationParticipants(this.conversation.id, emails)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (conversation) => {
          this.toasterService.success(
            "Persons added successfully!",
            "Congratulations!"
          );

          this.conversation = conversation;
          this.personsToInvite = [];

          this.filterParticipantsFromPersons();
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }
}
