import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../core/data.service';
import { Match } from '../../core/models';

type Tab = 'timeline' | 'lineups' | 'stats';

@Component({
  selector: 'app-match-center',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './match-center.html',
  styleUrl: './match-center.scss',
})
export class MatchCenter {
  private readonly route = inject(ActivatedRoute);
  readonly data = inject(DataService);

  readonly match = computed<Match | undefined>(() => {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    return this.data.getMatchById(id);
  });

  readonly tab = signal<Tab>('timeline');

  setTab(t: Tab) {
    this.tab.set(t);
  }

  readonly statLabels: Record<string, string> = {
    possession: 'Possession',
    shotsOnTarget: 'Shots on Target',
    xg: 'Expected Goals (xG)',
    shots: 'Total Shots',
  };

  statEntries(match: Match): { key: string; label: string; home: number; away: number; homePct: number }[] {
    return (Object.keys(match.stats) as (keyof typeof match.stats)[]).map((key) => {
      const [home, away] = match.stats[key];
      const total = home + away;
      return {
        key,
        label: this.statLabels[key] ?? key,
        home,
        away,
        homePct: total > 0 ? (home / total) * 100 : 50,
      };
    });
  }

  eventIcon(type: string): string {
    const icons: Record<string, string> = {
      goal: '⚽',
      card: '🟥',
      sub: '↻',
      half: '⏱',
      whistle: '📣',
    };
    return icons[type] ?? '•';
  }
}
