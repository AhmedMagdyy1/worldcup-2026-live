import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DataService } from '../../core/data.service';

type Tab = 'timeline' | 'lineups' | 'stats';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './live.html',
  styleUrl: './live.scss',
})
export class Live implements OnInit {
  private readonly data = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly match = this.data.liveMatch;
  readonly upcoming = this.data.upcomingToday;
  readonly completed = this.data.completedMatches;
  readonly stories = this.data.stories;
  readonly groupA = this.data.groups[0];

  readonly tab = signal<Tab>('timeline');
  readonly formation = signal<'4-3-3' | '3-5-2'>('4-3-3');

  readonly lineup433 = [
    [13],
    [19, 3, 5, 23],
    [4, 17, 14],
    [10, 22, 11],
  ];

  setTab(t: Tab) {
    this.tab.set(t);
  }

  ngOnInit() {
    const sub = this.data.startLiveTicker();
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
