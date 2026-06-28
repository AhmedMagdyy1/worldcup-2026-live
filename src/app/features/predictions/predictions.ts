import { Component, inject } from '@angular/core';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-predictions',
  standalone: true,
  templateUrl: './predictions.html',
  styleUrl: './predictions.scss',
})
export class Predictions {
  private readonly data = inject(DataService);
  readonly match = this.data.liveMatch;
}
