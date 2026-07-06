import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DataService } from '../../core/data.service';
import { BracketMatch } from '../../core/models';

export interface Pick { matchId: string; pickedCode: string; }

const LS_KEY = 'wc2026-picks';

@Component({
  selector: 'app-predictions',
  standalone: true,
  templateUrl: './predictions.html',
  styleUrl: './predictions.scss',
})
export class Predictions implements OnInit {
  private readonly data = inject(DataService);

  readonly picks = signal<Pick[]>([]);
  readonly bracket = this.data.bracket;

  readonly r16Matches = computed<BracketMatch[]>(() => this.bracket[0]?.matches ?? []);

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) this.picks.set(JSON.parse(raw));
    } catch { /* ignore */ }
  }

  matchId(match: BracketMatch): string {
    return `${match.home?.code ?? 'TBD'}-${match.away?.code ?? 'TBD'}`;
  }

  setPick(matchId: string, code: string): void {
    const current = this.picks();
    const idx = current.findIndex(p => p.matchId === matchId);
    const updated = idx >= 0
      ? current.map((p, i) => i === idx ? { matchId, pickedCode: code } : p)
      : [...current, { matchId, pickedCode: code }];
    this.picks.set(updated);
    try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }

  getPick(matchId: string): string | undefined {
    return this.picks().find(p => p.matchId === matchId)?.pickedCode;
  }

  readonly score = computed<number>(() => {
    let count = 0;
    for (const match of this.r16Matches()) {
      if (!match.winnerCode) continue;
      const id = this.matchId(match);
      const pick = this.picks().find(p => p.matchId === id);
      if (pick && pick.pickedCode === match.winnerCode) count++;
    }
    return count;
  });

  readonly pending = computed<number>(() => {
    let count = 0;
    for (const match of this.r16Matches()) {
      if (match.winnerCode) continue;
      const id = this.matchId(match);
      const pick = this.picks().find(p => p.matchId === id);
      if (pick) count++;
    }
    return count;
  });

  readonly totalResolved = computed<number>(() =>
    this.r16Matches().filter(m => !!m.winnerCode).length
  );
}
