import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { GeneralOverview } from 'src/app/model/general-overview.model';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() data: GeneralOverview[];
  @Input() title: string;

  @Output() deleteClicked = new EventEmitter<number>();
  @Output() viewClicked = new EventEmitter<number>();

  isTeacher: boolean;
  username: string;

  filteredData: GeneralOverview[];

  constructor(private authService: AuthService) {}

  onDeleteClicked(index: number): void {
    this.deleteClicked.emit(index);
  }

  onViewClicked(index: number): void {
    this.viewClicked.emit(index);
  }

  ngOnInit(): void {
    this.isTeacher = this.authService.isTeacher();
    this.username = this.authService.getUsername();

    this.filteredData = this.data;
  }

  onFilterItems(event: CustomEvent): void {
    if (event.detail.value !== '') {
      this.filteredData = this.data.filter((data) => {
        return (
          data.name
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase()) ||
          data.name
            .toLowerCase()
            .includes(String(event.detail.value).toLowerCase())
        );
      });
    } else {
      this.filteredData = this.data;
    }
  }
}
