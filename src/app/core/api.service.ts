import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BracketMatch, BracketRound, BracketTeam } from './models';
import { EspnScoreboardResponse, EspnStandingsResponse } from './api.models';

const ESPN_BASE = 'https://site.api.espn.com/apis';

const FLAG_MAP: Record<string, string> = {
  CAN: '🇨🇦', RSA: '🇿🇦', BRA: '🇧🇷', JPN: '🇯🇵', PAR: '🇵🇾', GER: '🇩🇪',
  MAR: '🇲🇦', NED: '🇳🇱', NOR: '🇳🇴', CIV: '🇨🇮', FRA: '🇫🇷', SWE: '🇸🇪',
  MEX: '🇲🇽', ECU: '🇪🇨', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', COD: '🇨🇩', BEL: '🇧🇪', SEN: '🇸🇳',
  USA: '🇺🇸', BIH: '🇧🇦', ESP: '🇪🇸', AUT: '🇦🇹', POR: '🇵🇹', CRO: '🇭🇷',
  SUI: '🇨🇭', ALG: '🇩🇿', EGY: '🇪🇬', AUS: '🇦🇺', ARG: '🇦🇷', CPV: '🇨🇻',
  COL: '🇨🇴', GHA: '🇬🇭', URU: '🇺🇾', KOR: '🇰🇷', IRN: '🇮🇷', QAT: '🇶🇦',
  ITA: '🇮🇹', TUN: '🇹🇳', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', UKR: '🇺🇦', VEN: '🇻🇪', TUR: '🇹🇷',
  WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', DEN: '🇩🇰', NGA: '🇳🇬', POL: '🇵🇱', SRB: '🇷🇸', KSA: '🇸🇦',
  CMR: '🇨🇲', CRC: '🇨🇷', JAM: '🇯🇲', UZB: '🇺🇿', JOR: '🇯🇴',
};

const KNOCKOUT_SLUGS = new Set([
  'round-of-32', 'round-of-16', 'quarterfinals', 'semifinals', 'final', '3rd-place-match',
]);

const ROUND_NAMES: Record<string, string> = {
  'round-of-32': 'Round of 32',
  'round-of-16': 'Round of 16',
  'quarterfinals': 'Quarterfinals',
  'semifinals': 'Semifinals',
  'final': 'Final',
  '3rd-place-match': '3rd Place',
};

const ROUND_ORDER = ['round-of-32', 'round-of-16', 'quarterfinals', 'semifinals', 'final', '3rd-place-match'];

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  getStandings(): Observable<EspnStandingsResponse | null> {
    return this.http
      .get<EspnStandingsResponse>(`${ESPN_BASE}/v2/sports/soccer/fifa.world/standings`)
      .pipe(catchError(() => of(null)));
  }

  getScoreboard(): Observable<EspnScoreboardResponse | null> {
    return this.http
      .get<EspnScoreboardResponse>(`${ESPN_BASE}/site/v2/sports/soccer/fifa.world/scoreboard`)
      .pipe(catchError(() => of(null)));
  }

  getKnockoutBracket(): Observable<BracketRound[]> {
    return this.http.get<any>(
      `${ESPN_BASE}/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260627-20260728`
    ).pipe(
      map(data => this.parseKnockoutBracket(data)),
      catchError(() => of([])),
    );
  }

  private eventToMatch(event: any): BracketMatch {
    const comp = event.competitions?.[0];
    const competitors = comp?.competitors ?? [];
    const home = competitors.find((c: any) => c.homeAway === 'home');
    const away = competitors.find((c: any) => c.homeAway === 'away');
    const winner = competitors.find((c: any) => c.winner);

    const toTeam = (c: any): BracketTeam | null => {
      if (!c) return null;
      const abbr = (c.team?.abbreviation ?? '').toUpperCase();
      if (!abbr || abbr.startsWith('RD') || abbr.startsWith('QF') || abbr.startsWith('QW') || abbr.startsWith('SF') || abbr.startsWith('SFW')) return null;
      return { code: abbr, name: c.team?.displayName ?? abbr, flag: FLAG_MAP[abbr] ?? '🏳️' };
    };

    const statusName = event.status?.type?.name ?? '';
    const isFinished = statusName.includes('FULL_TIME') || statusName.includes('FINAL');
    const isLive = statusName.includes('IN_PROGRESS');

    let detail: string | undefined;
    if (statusName === 'STATUS_FINAL_PEN') detail = 'Pens';
    if (statusName === 'STATUS_FINAL_AET') detail = 'AET';

    return {
      home: toTeam(home),
      away: toTeam(away),
      homeScore: isFinished || isLive ? Number(home?.score ?? 0) : undefined,
      awayScore: isFinished || isLive ? Number(away?.score ?? 0) : undefined,
      winnerCode: winner?.team?.abbreviation,
      status: isFinished ? 'finished' : isLive ? 'live' : 'scheduled',
      detail,
    };
  }

  private parseKnockoutBracket(data: any): BracketRound[] {
    const events: any[] = data?.events ?? [];
    const bySlug = new Map<string, any[]>();

    for (const event of events) {
      const slug: string = event.season?.slug ?? '';
      if (!KNOCKOUT_SLUGS.has(slug)) continue;
      if (!bySlug.has(slug)) bySlug.set(slug, []);
      bySlug.get(slug)!.push(event);
    }

    if (bySlug.size === 0) return [];

    const rounds: BracketRound[] = [];
    for (const slug of ROUND_ORDER) {
      const slugEvents = bySlug.get(slug);
      if (!slugEvents || slugEvents.length === 0) continue;
      rounds.push({
        name: ROUND_NAMES[slug] ?? slug,
        matches: slugEvents.map(e => this.eventToMatch(e)),
      });
    }
    return rounds;
  }
}
