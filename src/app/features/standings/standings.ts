import { Component, inject, signal } from '@angular/core';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-standings',
  standalone: true,
  templateUrl: './standings.html',
  styleUrl: './standings.scss',
})
export class Standings {
  private readonly data = inject(DataService);
  readonly groups = this.data.groups;
  readonly filter = signal<'all' | 'ad' | 'eh'>('all');
}
