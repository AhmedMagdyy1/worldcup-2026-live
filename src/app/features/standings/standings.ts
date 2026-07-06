import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataService } from '../../core/data.service';
import { Group } from '../../core/models';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [],
  templateUrl: './standings.html',
  styleUrl: './standings.scss',
})
export class Standings implements OnInit {
  private readonly data = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filter = signal<'all' | 'ad' | 'eh' | 'il'>('all');
  readonly allGroups = signal<Group[]>(this.data.groups);

  ngOnInit() {
    this.data.liveStandings$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((groups) => this.allGroups.set(groups));
  }

  get groups() {
    const f = this.filter();
    const all = this.allGroups();
    if (f === 'all') return all;
    const letters = f === 'ad' ? ['A', 'B', 'C', 'D'] : f === 'eh' ? ['E', 'F', 'G', 'H'] : ['I', 'J', 'K', 'L'];
    return all.filter((g) => letters.includes(g.name.replace('Group ', '')));
  }
}
