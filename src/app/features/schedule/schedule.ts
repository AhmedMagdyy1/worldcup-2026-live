import { Component, inject } from '@angular/core';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class Schedule {
  private readonly data = inject(DataService);
  readonly upcoming = this.data.upcomingToday;
  readonly completed = this.data.completedMatches;
}
