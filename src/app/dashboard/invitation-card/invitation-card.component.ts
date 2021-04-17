import { Component, EventEmitter, Input, Output } from "@angular/core";
import { GeneralOverview } from "src/app/model/general-overview.model";

@Component({
  selector: "app-invitation-card",
  templateUrl: "./invitation-card.component.html",
  styleUrls: ["./invitation-card.component.scss"],
})
export class InvitationCardComponent {
  @Input() data: GeneralOverview[];
  @Input() title: string;

  @Output() onAcceptClicked = new EventEmitter<number>();
  @Output() onDeclineClicked = new EventEmitter<number>();

  constructor() {}

  acceptClicked(index: number): void {
    this.onAcceptClicked.emit(index);
  }

  declineClicked(index: number): void {
    this.onDeclineClicked.emit(index);
  }
}
