import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GeneralOverview } from 'src/app/model/general-overview.model';

@Component({
  selector: 'app-invitation-card',
  templateUrl: './invitation-card.component.html',
  styleUrls: ['./invitation-card.component.scss'],
})
export class InvitationCardComponent {
  @Input() data: GeneralOverview[];
  @Input() title: string;

  @Output() acceptClicked = new EventEmitter<number>();
  @Output() declineClicked = new EventEmitter<number>();

  constructor() {}

  onAcceptClicked(index: number): void {
    this.acceptClicked.emit(index);
  }

  onDeclineClicked(index: number): void {
    this.declineClicked.emit(index);
  }
}
