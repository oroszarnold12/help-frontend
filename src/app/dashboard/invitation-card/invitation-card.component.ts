import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { GeneralOverview } from "src/app/model/general-overview.model";

@Component({
  selector: "app-invitation-card",
  templateUrl: "./invitation-card.component.html",
  styleUrls: ["./invitation-card.component.scss"],
})
export class InvitationCardComponent implements OnInit {
  @Input() data: GeneralOverview[];
  @Input() title: string;
  @Output() onAcceptClicked = new EventEmitter<number>();
  @Output() onDeclineClicked = new EventEmitter<number>();

  constructor() {}

  ngOnInit() {}

  acceptClicked(index) {
    this.onAcceptClicked.emit(index);
  }

  declineClicked(index) {
    this.onDeclineClicked.emit(index);
  }
}
