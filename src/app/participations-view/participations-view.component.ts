import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Participation } from '../model/participation.model';
import { BackButtonService } from '../shared/back-button.service';
import { ParticipationService } from '../shared/participation.service';
import { ToasterService } from '../shared/toaster.service';

@Component({
  selector: 'app-participations-view',
  templateUrl: './participations-view.component.html',
  styleUrls: ['./participations-view.component.scss'],
})
export class ParticipationsViewComponent implements OnInit, OnDestroy {
  stop: Subject<void> = new Subject();

  participaions: Participation[];
  filteredParticipaions: Participation[];

  constructor(
    private participationService: ParticipationService,
    private bakcButtonService: BackButtonService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.bakcButtonService.turnOn();

    this.participationService
      .getParticipations()
      .pipe(takeUntil(this.stop))
      .subscribe(
        (parrticipations) => {
          this.participaions = parrticipations;
          this.filteredParticipaions = parrticipations;
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }

  ngOnDestroy(): void {
    this.stop.next();
    this.stop.complete();
  }

  onSaveClicked(): void {
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
            'Participations updated successfuly!',
            'Congratulations!'
          );
        },
        (error) => {
          this.toasterService.error(error.error.message, 'Please try again!');
        }
      );
  }

  onFilterParticipations(event: CustomEvent): void {
    if (event.detail.value !== '') {
      this.filteredParticipaions = this.participaions.filter(
        (participation) => {
          return (
            participation.course.name
              .toLowerCase()
              .includes(String(event.detail.value).toLowerCase()) ||
            participation.course.name
              .toLowerCase()
              .includes(String(event.detail.value).toLowerCase())
          );
        }
      );
    } else {
      this.filteredParticipaions = this.participaions;
    }
  }
}
