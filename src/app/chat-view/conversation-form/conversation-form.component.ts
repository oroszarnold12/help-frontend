import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConversationService } from 'src/app/shared/conversation.service';
import { PersonService } from 'src/app/shared/person.service';
import { ToasterService } from 'src/app/shared/toaster.service';

@Component({
  selector: 'app-conversation-form',
  templateUrl: './conversation-form.component.html',
  styleUrls: ['./conversation-form.component.scss'],
})
export class ConversationFormComponent implements OnInit, OnDestroy {
  private stop: Subject<void> = new Subject();

  persons: any[];
  personsToInvite: any[];

  groupConversation: boolean;

  conversationFrom: FormGroup;

  constructor(
    private modalController: ModalController,
    private personService: PersonService,
    private toasterService: ToasterService,
    private conversationService: ConversationService
  ) {
    this.groupConversation = false;
    this.personsToInvite = [];
  }

  ngOnInit(): void {
    this.loadPersons();

    this.conversationFrom = this.createFormGroup();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(32),
      ]),
    });
  }

  get errorControl(): {
    [key: string]: AbstractControl;
  } {
    return this.conversationFrom.controls;
  }

  loadPersons(): void {
    this.personService
      .getPersons()
      .pipe(takeUntil(this.stop))
      .subscribe(
        (data) => {
          this.persons = data.persons;

          this.persons.forEach((person) => {
            person.fullName =
              person.firstName +
              ' ' +
              person.lastName +
              ' - Group: ' +
              (person.personGroup ? person.personGroup : 'None');
          });
        },
        () => {
          this.toasterService.error(
            'Could not load persons!',
            'Something went wrong!'
          );
        }
      );
  }

  dismissModal(): void {
    this.modalController.dismiss();
  }

  onConversationTypeChanged(event: CustomEvent): void {
    if (event.detail.value === 'simple') {
      this.groupConversation = false;
    } else if (event.detail.value === 'group') {
      this.groupConversation = true;
    }
  }

  getButtonDisabled(): boolean {
    if (this.groupConversation) {
      return this.conversationFrom.invalid || this.personsToInvite.length === 0;
    } else {
      return (
        this.personsToInvite.length === 0 || this.personsToInvite.length > 1
      );
    }
  }

  onCreateButtonClicked(): void {
    const emails: string[] = this.personsToInvite.map((person) => person.email);

    this.conversationService
      .saveConversation(emails, this.conversationFrom.get('name').value)
      .pipe(takeUntil(this.stop))
      .subscribe(
        () => {
          this.toasterService.success(
            'Conversation created successfully!',
            'Congratulations!'
          );

          this.dismissModal();
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }
}
