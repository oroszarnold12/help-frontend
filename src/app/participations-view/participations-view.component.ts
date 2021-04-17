import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Participation } from "../model/participation.model";
import { BackButtonService } from "../shared/back-button.service";
import { ParticipationService } from "../shared/participation.service";
import { ToasterService } from "../shared/toaster.service";

@Component({
  selector: "app-participations-view",
  templateUrl: "./participations-view.component.html",
  styleUrls: ["./participations-view.component.scss"],
})
export class ParticipationsViewComponent implements OnInit, OnDestroy {
  participaions: Participation[];
  stop: Subject<void> = new Subject();

  constructor(
    private participationService: ParticipationService,
    private bakcButtonService: BackButtonService,
    private toasterService: ToasterService
  ) {}

  ngOnInit() {
    this.bakcButtonService.turnOn();

    this.participationService
      .getParticipations()
      .pipe(takeUntil(this.stop))
      .subscribe(
        (parrticipations) => {
          this.participaions = parrticipations;
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  onSaveClicked() {
    const newParticipations = this.participaions.map((participation) => ({
      courseId: participation.course.id,
      showOnDashboard: participation.showOnDashboard,
    }));

    this.participationService
      .updateParticipations(newParticipations)
      .pipe(takeUntil(this.stop))
      .subscribe(
        (participations) => {
          this.participaions = participations;

          this.toasterService.success(
            "Participations updated successfuly!",
            "Congratulations!"
          );
        },
        (error) => {
          this.toasterService.error(error.error.message, "Please try again!");
        }
      );
  }
}
