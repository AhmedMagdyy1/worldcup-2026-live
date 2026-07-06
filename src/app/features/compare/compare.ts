import { Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../core/data.service';
import { Team } from '../../core/models';

export interface StatRow {
  label: string;
  aValue: string | number;
  bValue: string | number;
  aWins: boolean;
  bWins: boolean;
}

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [],
  templateUrl: './compare.html',
  styleUrl: './compare.scss',
})
export class Compare {
  private readonly data = inject(DataService);

  readonly teams = this.data.allTeams().sort((a, b) => a.name.localeCompare(b.name));

  readonly teamA = signal<Team | null>(null);
  readonly teamB = signal<Team | null>(null);

  readonly statsRows = computed<StatRow[]>(() => {
    const a = this.teamA();
    const b = this.teamB();
    if (!a || !b) return [];

    const aPos = this.getGroupPosition(a);
    const bPos = this.getGroupPosition(b);
    const aForm = a.form.filter((r) => r === 'W').length;
    const bForm = b.form.filter((r) => r === 'W').length;
    const aRating = this.avgRating(a.code);
    const bRating = this.avgRating(b.code);

    return [
      {
        label: 'FIFA Rank',
        aValue: `#${a.rank}`,
        bValue: `#${b.rank}`,
        aWins: a.rank < b.rank,
        bWins: b.rank < a.rank,
      },
      {
        label: 'Form (Wins)',
        aValue: `${aForm} W`,
        bValue: `${bForm} W`,
        aWins: aForm > bForm,
        bWins: bForm > aForm,
      },
      {
        label: 'Avg Squad Rating',
        aValue: aRating.toFixed(1),
        bValue: bRating.toFixed(1),
        aWins: aRating > bRating,
        bWins: bRating > aRating,
      },
      {
        label: 'Group Position',
        aValue: aPos !== null ? `${aPos}${this.ordinal(aPos)}` : 'N/A',
        bValue: bPos !== null ? `${bPos}${this.ordinal(bPos)}` : 'N/A',
        aWins: aPos !== null && bPos !== null && aPos < bPos,
        bWins: aPos !== null && bPos !== null && bPos < aPos,
      },
    ];
  });

  readonly ready = computed(() => this.teamA() !== null && this.teamB() !== null);

  onSelectA(event: Event) {
    const code = (event.target as HTMLSelectElement).value;
    this.teamA.set(code ? (this.teams.find((t) => t.code === code) ?? null) : null);
  }

  onSelectB(event: Event) {
    const code = (event.target as HTMLSelectElement).value;
    this.teamB.set(code ? (this.teams.find((t) => t.code === code) ?? null) : null);
  }

  private getGroupPosition(team: Team): number | null {
    for (const group of this.data.groups) {
      const row = group.rows.find((r) => r.team.code === team.code);
      if (row) return row.pos;
    }
    return null;
  }

  private avgRating(code: string): number {
    const squad = this.data.getSquad(code);
    if (!squad || squad.length === 0) return 0;
    return squad.reduce((sum, p) => sum + p.rating, 0) / squad.length;
  }

  private ordinal(n: number): string {
    if (n === 1) return 'st';
    if (n === 2) return 'nd';
    if (n === 3) return 'rd';
    return 'th';
  }
}
