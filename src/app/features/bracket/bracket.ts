import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataService } from '../../core/data.service';
import { BracketMatch, BracketRound } from '../../core/models';

const BH  = 1100;
const CW  = 154;
const CG  = 56;
const MH  = 52;
const PAD = 24;

@Component({
  selector: 'app-bracket',
  standalone: true,
  imports: [UpperCasePipe],
  templateUrl: './bracket.html',
  styleUrl: './bracket.scss',
})
export class Bracket implements OnInit {
  private readonly data = inject(DataService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _rounds = signal<BracketRound[]>(this.data.bracket);
  readonly selectedRoundIndex = signal(0);

  readonly BH = BH;
  readonly CW = CW;
  readonly MH = MH;

  get rounds(): BracketRound[] { return this._rounds(); }

  get mainRounds(): BracketRound[] {
    return this.rounds.filter(r => r.name !== '3rd Place');
  }

  get thirdPlace(): BracketRound | null {
    return this.rounds.find(r => r.name === '3rd Place') ?? null;
  }

  get champion(): string | null {
    return this.mainRounds.find(r => r.name === 'Final')?.matches[0]?.winnerCode ?? null;
  }

  get treeWidth(): number {
    const n = this.mainRounds.length;
    return PAD * 2 + n * CW + Math.max(n - 1, 0) * CG;
  }

  colX(ri: number): number {
    return PAD + ri * (CW + CG);
  }

  matchY(ri: number, mi: number): number {
    const n = this.mainRounds[ri]?.matches.length ?? 1;
    return ((2 * mi + 1) * BH) / (2 * n);
  }

  get svgLines(): { x1: number; y1: number; x2: number; y2: number }[] {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const rounds = this.mainRounds;

    for (let ri = 0; ri < rounds.length - 1; ri++) {
      const curCount  = rounds[ri].matches.length;
      const nextCount = rounds[ri + 1].matches.length;
      const rightX = this.colX(ri) + CW;
      const leftX  = this.colX(ri + 1);
      const midX   = (rightX + leftX) / 2;

      for (let mi = 0; mi < curCount; mi++) {
        lines.push({ x1: rightX, y1: this.matchY(ri, mi), x2: midX, y2: this.matchY(ri, mi) });
      }

      for (let ni = 0; ni < nextCount; ni++) {
        const f1i = ni * 2;
        const f2i = ni * 2 + 1;
        if (f1i < curCount && f2i < curCount) {
          lines.push({ x1: midX, y1: this.matchY(ri, f1i), x2: midX, y2: this.matchY(ri, f2i) });
        }
        lines.push({ x1: midX, y1: this.matchY(ri + 1, ni), x2: leftX, y2: this.matchY(ri + 1, ni) });
      }
    }
    return lines;
  }

  isWinner(match: BracketMatch, side: 'home' | 'away'): boolean {
    if (!match.winnerCode) return false;
    return match.winnerCode === (side === 'home' ? match.home : match.away)?.code;
  }

  isEliminated(match: BracketMatch, side: 'home' | 'away'): boolean {
    if (!match.winnerCode) return false;
    return !this.isWinner(match, side) && !!(side === 'home' ? match.home : match.away);
  }

  ngOnInit() {
    this.data.liveBracket$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(rounds => this._rounds.set(rounds));
  }

  selectRound(i: number) { this.selectedRoundIndex.set(i); }
}
