import { Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../core/data.service';
import { ScheduleFixture } from '../../core/models';

type StatusFilter = 'all' | 'upcoming' | 'live' | 'finished';
type GroupFilter = 'all' | string;

@Component({
  selector: 'app-schedule',
  standalone: true,
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class Schedule {
  private readonly data = inject(DataService);

  readonly allFixtures: ScheduleFixture[] = this.data.getFixtures();

  readonly groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  readonly groupFilter = signal<GroupFilter>('all');
  readonly statusFilter = signal<StatusFilter>('all');

  readonly filteredFixtures = computed(() => {
    const gf = this.groupFilter();
    const sf = this.statusFilter();
    return this.allFixtures.filter((f) => {
      const matchGroup = gf === 'all' || f.group === gf;
      const matchStatus = sf === 'all' || f.status === sf;
      return matchGroup && matchStatus;
    });
  });

  readonly fixturesByDate = computed(() => {
    const dateMap = new Map<string, ScheduleFixture[]>();
    for (const f of this.filteredFixtures()) {
      const key = f.date.toDateString();
      if (!dateMap.has(key)) dateMap.set(key, []);
      dateMap.get(key)!.push(f);
    }
    return Array.from(dateMap.entries()).map(([key, fixtures]) => ({
      label: new Date(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      fixtures,
    }));
  });

  setGroup(g: GroupFilter) { this.groupFilter.set(g); }
  setStatus(s: StatusFilter) { this.statusFilter.set(s); }

  statusLabel(s: ScheduleFixture['status']): string {
    if (s === 'live') return 'LIVE';
    if (s === 'finished') return 'FT';
    return 'UP';
  }
}
