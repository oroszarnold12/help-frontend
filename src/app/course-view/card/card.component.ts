import { Component, Input, OnInit, Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { GeneralOverview } from "src/app/model/general-overview.model";

@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent implements OnInit {
  @Input() data: GeneralOverview[];
  @Input() title: string;
  @Output() onDeleteClicked = new EventEmitter<number>();

  constructor() {}

  deleteClicked(index: number) {
    this.onDeleteClicked.emit(index);
  }

  ngOnInit() {}
}
