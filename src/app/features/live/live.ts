import { Component, DestroyRef, OnInit, effect, inject, signal, untracked } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';

type Tab = 'timeline' | 'lineups' | 'stats';

@Component({
  selector: 'app-live',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
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
  readonly scoreFlash = signal(false);

  readonly lineup433 = [
    [13],
    [19, 3, 5, 23],
    [4, 17, 14],
    [10, 22, 11],
  ];

  constructor() {
    effect(() => {
      if (this.data._goalFired()) {
        this.scoreFlash.set(true);
        untracked(() => this.data._goalFired.set(false));
        setTimeout(() => this.scoreFlash.set(false), 2000);
      }
    });
  }

  setTab(t: Tab) {
    this.tab.set(t);
  }

  ngOnInit() {
    const sub = this.data.startLiveTicker();
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
