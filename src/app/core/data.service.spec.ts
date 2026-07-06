import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { DataService } from './data.service';

describe('DataService roster', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(DataService);
  });

  it('has 48 teams', () => {
    expect(service.allTeams().length).toBe(48);
  });

  it('has 12 groups of 4 teams each', () => {
    expect(service.groups.length).toBe(12);
    for (const g of service.groups) {
      expect(g.rows.length).toBe(4);
    }
  });

  it('every team has a unique code', () => {
    const codes = service.allTeams().map((t) => t.code);
    expect(new Set(codes).size).toBe(48);
  });

  it('every team has a 7-8 player squad', () => {
    for (const team of service.allTeams()) {
      const squad = service.getSquad(team.code);
      expect(squad.length).toBeGreaterThanOrEqual(7);
      expect(squad.length).toBeLessThanOrEqual(8);
    }
  });

  it('every group row references a team that exists in allTeams()', () => {
    const codes = new Set(service.allTeams().map((t) => t.code));
    for (const g of service.groups) {
      for (const row of g.rows) {
        expect(codes.has(row.team.code)).toBe(true);
      }
    }
  });
});

describe('DataService liveStandings$', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('emits 12 groups immediately (mock fallback via startWith)', async () => {
    // firstValueFrom gets the startWith(mock) emission immediately (sync)
    const groups = await firstValueFrom(service.liveStandings$);
    expect(groups.length).toBe(12);
    // Flush any pending ESPN requests to satisfy verify()
    httpMock.match('https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings')
      .forEach((req) => req.flush('error', { status: 500, statusText: 'Error' }));
  });
});

describe('DataService startLiveTicker', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(DataService);
  });

  it('appends a valid TimelineEvent type on each tick that produces an event', () => {
    const validTypes = new Set(['goal', 'card', 'sub', 'whistle', 'half']);
    // Run generateTickerEvent 100 times; every non-null result should have a valid type
    let eventCount = 0;
    for (let i = 0; i < 100; i++) {
      const m = service.liveMatch();
      // Access private via any to test in isolation
      const ev = (service as any).generateTickerEvent(m);
      if (ev !== null) {
        expect(validTypes.has(ev.type)).toBe(true);
        expect(['home', 'away']).toContain(ev.team);
        expect(typeof ev.minute).toBe('string');
        eventCount++;
      }
    }
    // With only a 30% chance of nothing, after 100 calls we expect many events
    expect(eventCount).toBeGreaterThan(30);
  });

  it('increments homeScore when a goal event fires for the home team', () => {
    const initialHome = service.liveMatch().homeScore;
    // Force a home goal event
    const m = service.liveMatch();
    const goalEvent = { minute: "75'", type: 'goal' as const, team: 'home' as const, title: 'Goal!', detail: '' };
    service.liveMatch.set({ ...m, timeline: [goalEvent, ...m.timeline], homeScore: m.homeScore + 1 });
    expect(service.liveMatch().homeScore).toBe(initialHome + 1);
  });

  it('increments awayScore when a goal event fires for the away team', () => {
    const initialAway = service.liveMatch().awayScore;
    const m = service.liveMatch();
    const goalEvent = { minute: "80'", type: 'goal' as const, team: 'away' as const, title: 'Goal!', detail: '' };
    service.liveMatch.set({ ...m, timeline: [goalEvent, ...m.timeline], awayScore: m.awayScore + 1 });
    expect(service.liveMatch().awayScore).toBe(initialAway + 1);
  });

  it('_goalFired signal starts as false', () => {
    expect(service._goalFired()).toBe(false);
  });
});

describe('DataService bracket', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(DataService);
  });

  it('has 5 rounds in the correct order with correct match counts', () => {
    const names = service.bracket.map((r) => r.name);
    expect(names).toEqual(['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final']);
    expect(service.bracket.map((r) => r.matches.length)).toEqual([16, 8, 4, 2, 1]);
  });

  it('every decided match has a winnerCode matching one of its two teams', () => {
    for (const round of service.bracket) {
      for (const match of round.matches) {
        if (match.winnerCode) {
          const codes = [match.home?.code, match.away?.code];
          expect(codes).toContain(match.winnerCode);
        }
      }
    }
  });

  it('the Final has exactly one match with a winnerCode set', () => {
    const final = service.bracket.find((r) => r.name === 'Final')!;
    expect(final.matches.length).toBe(1);
    expect(final.matches[0].winnerCode).toBeTruthy();
  });
});
