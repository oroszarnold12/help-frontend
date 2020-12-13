import { Component, Input, OnInit } from "@angular/core";
import { GeneralOverview } from "src/app/model/general-overview.model";

@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent implements OnInit {
  @Input() data: GeneralOverview[];
  @Input() title: string;

  constructor() {}

  ngOnInit() {}
}
