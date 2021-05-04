import { DatePipe } from "@angular/common";
import {
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { AlertController, IonContent, ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil, timeInterval } from "rxjs/operators";
import { ConversationMessage } from "../model/conversation-message.model";
import { Conversation } from "../model/conversation.model";
import { Person } from "../model/person.model";
import { ThinPerson } from "../model/thin.person.model";
import { url } from "../shared/api-config";
import { ConversationService } from "../shared/conversation.service";
import { PersonService } from "../shared/person.service";
import { ToasterService } from "../shared/toaster.service";
import { ConversationFormComponent } from "./conversation-form/conversation-form.component";
import { ParticipantViewComponent } from "./participant-view/participant-view.component";

@Component({
  selector: "app-chat-view",
  templateUrl: "./chat-view.component.html",
  styleUrls: ["./chat-view.component.scss"],
})
export class ChatViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();

  conversations: Conversation[];
  filteredConversations: Conversation[];
  conversationImageUrls: string[];
  currentConversation: Conversation;
  newConversationMessage: string;

  user: Person;
  userImgUrl: string;

  openConversationDetails: boolean;

  @ViewChild("content", { static: false }) content: IonContent;

  constructor(
    private conversationService: ConversationService,
    private toasterService: ToasterService,
    private datePipe: DatePipe,
    private personService: PersonService,
    private alertController: AlertController,
    private modalController: ModalController,
    private ngZone: NgZone,
    private router: Router
  ) {
    this.openConversationDetails = false;
    this.newConversationMessage = "";

    this.conversationService.newMessage$.subscribe(() => {
      this.ngZone.run(() => {
        this.loadConversations();

        if (!!this.currentConversation) {
          this.loadConversation(this.currentConversation.id);
        }
      });
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === "/chat") {
          this.loadConversations();

          if (!!this.currentConversation) {
            this.loadConversation(this.currentConversation.id);
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  loadConversations(): void {
    this.conversationService
      .getConversations()
      .pipe(takeUntil(this.stop))
      .subscribe(
        (conversations) => {
          this.conversations = conversations;

          this.conversations.sort((conv1, conv2) => {
            if (!!!conv1.lastMessage) {
              return 1;
            }

            if (!!!conv2.lastMessage) {
              return -1;
            }

            return (
              new Date(conv2.lastMessage.creationDate).getTime() -
              new Date(conv1.lastMessage.creationDate).getTime()
            );
          });

          this.filteredConversations = this.conversations;

          this.loadUser();
        },
        () => {
          this.toasterService.error(
            "Could not load conversations!",
            "Something went wrong!"
          );
        }
      );
  }

  loadUser(): void {
    this.personService
      .getCurrentUser()
      .pipe(takeUntil(this.stop))
      .subscribe(
        (user) => {
          this.user = user;
          this.userImgUrl = this.getImageUrlById(this.user.id);

          this.conversationImageUrls = [];
          this.conversations.forEach((conversation) => {
            this.conversationImageUrls[
              conversation.id
            ] = this.getConversationImgUrl(conversation);
          });
        },
        (error) => {
          this.toasterService.error(
            error.error.message,
            "Something went wrong!"
          );
        }
      );
  }

  loadConversation(conversationId: number): void {
    this.conversationService
      .getConversation(conversationId)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (conversation) => {
          this.currentConversation = conversation;

          setTimeout(() => {
            this.content.scrollToBottom(0);
          }, 100);
        },
        () => {
          this.toasterService.error(
            "Could not get conversation!",
            "Something went wrong!"
          );
        }
      );
  }

  getImageUrlById(id: number): string {
    return url + "/user/" + id + "/image/?" + new Date().getTime();
  }

  formatDate(date: Date): string {
    let today = new Date();
    let yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());

    if (this.isSameDate(today, date))
      return this.datePipe.transform(date, "HH:mm");
    else if (this.isSameDate(yesterday, date)) return "Yesterday";
    else return this.datePipe.transform(date, "MMMM d");
  }

  isSameDate(d1: Date, d2: Date): boolean {
    d1 = new Date(d1);
    d2 = new Date(d2);
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }

  formatMessage(message: ConversationMessage): string {
    let content: string;

    if (message.creator.id === this.user.id) {
      content = "You: ";
    } else {
      content =
        message.creator.firstName + " " + message.creator.lastName + ": ";
    }

    content = content + message.content;

    if (content.length > 33) {
      return content.substring(0, 30) + "...";
    } else {
      return content;
    }
  }

  onConversationClicked(conversationId: number): void {
    this.openConversationDetails = true;
    this.loadConversation(conversationId);
  }

  onBackButtonClicked(): void {
    this.openConversationDetails = false;
    this.loadConversations();
  }

  onSendMessageClicked(): void {
    if (this.newConversationMessage.length > 0) {
      this.conversationService
        .saveConversationMessage(
          this.currentConversation.id,
          this.newConversationMessage
        )
        .pipe(takeUntil(this.stop))
        .subscribe(
          () => {
            this.toasterService.success(
              "Message sent successfully!",
              "Congratulations!"
            );

            this.loadConversation(this.currentConversation.id);
            this.newConversationMessage = "";
          },
          (error) => {
            this.toasterService.error(error.error.message, "Please try again!");
          }
        );
    } else {
      this.toasterService.error("Message can't be empty!", "Please try again!");
    }
  }

  async onDeleteMessageClicked(messageId: number): Promise<void> {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: "Are you sure that you want to delete this message?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Yes",
          handler: () => {
            this.conversationService
              .updateConversationMessage(
                this.currentConversation.id,
                messageId,
                "Message removed!"
              )
              .pipe(takeUntil(this.stop))
              .subscribe(
                () => {
                  this.toasterService.success(
                    "Message deleted successfully!",
                    "Congratulations!"
                  );

                  this.loadConversation(this.currentConversation.id);
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

  getConversationName(conversation: Conversation): string {
    if (!!conversation.name) {
      return conversation.name;
    } else {
      let recipient: ThinPerson = conversation.participants.filter(
        (particpant) => particpant.id !== this.user.id
      )[0];

      recipient = recipient ? recipient : this.user;

      return recipient.firstName + " " + recipient.lastName;
    }
  }

  getConversationImgUrl(conversation: Conversation): string {
    if (!!conversation.name) {
      return "";
    } else {
      let recipient: ThinPerson = conversation.participants.filter(
        (particpant) => particpant.id !== this.user.id
      )[0];

      recipient = recipient ? recipient : this.user;

      return this.getImageUrlById(recipient.id);
    }
  }

  async presentConversationModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: ConversationFormComponent,
      cssClass: "my-custom-modal-css",
    });

    modal.onDidDismiss().then(() => this.loadConversations());

    await modal.present();
  }

  async presentParticipantModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: ParticipantViewComponent,
      cssClass: "my-custom-modal-css",
      componentProps: {
        conversation: this.currentConversation,
      },
    });

    await modal.present();
  }

  onFilterChat(event: CustomEvent): void {
    if (event.detail.value !== "") {
      this.filteredConversations = this.conversations.filter((conversation) => {
        return (
          this.getConversationName(conversation)
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase()) ||
          this.getConversationName(conversation)
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase())
        );
      });
    } else {
      this.filteredConversations = this.conversations;
    }
  }
}
