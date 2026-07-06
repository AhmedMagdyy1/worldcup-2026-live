import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MatchCenter } from './match-center';
import { DataService } from '../../core/data.service';
import { Match } from '../../core/models';

const mockMatch: Match = {
  id: 'test-match',
  group: 'Group A',
  stadium: 'Test Stadium',
  kickoff: '20:00',
  status: 'live',
  minute: 45,
  home: { code: 'TST', name: 'Test Home', flag: '🏴', rank: 1, group: 'A', form: ['W'] },
  away: { code: 'AWY', name: 'Test Away', flag: '🏴', rank: 2, group: 'A', form: ['L'] },
  homeScore: 1,
  awayScore: 0,
  stats: { possession: [60, 40], shotsOnTarget: [5, 2], xg: [1.2, 0.5], shots: [10, 5] },
  winProb: [70, 20, 10],
  timeline: [
    { minute: "30'", type: 'goal', team: 'home', title: 'Goal! Test Player', detail: 'Great strike' },
    { minute: "15'", type: 'card', team: 'away', title: 'Yellow Card', detail: 'Foul' },
  ],
};

function makeDataService(match: Match | undefined) {
  return {
    getMatchById: (_id: string) => match,
    getSquad: (_code: string) => [],
  };
}

function makeRoute(id: string) {
  return {
    snapshot: { paramMap: { get: (_: string) => id } },
  };
}

async function setup(id: string, match: Match | undefined) {
  await TestBed.configureTestingModule({
    imports: [MatchCenter],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: makeRoute(id) },
      { provide: DataService, useValue: makeDataService(match) },
    ],
  }).compileComponents();

  const fixture: ComponentFixture<MatchCenter> = TestBed.createComponent(MatchCenter);
  fixture.detectChanges();
  return fixture;
}

describe('MatchCenter', () => {
  it('renders home and away team names for a known match', async () => {
    const fixture = await setup('test-match', mockMatch);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test Home');
    expect(el.textContent).toContain('Test Away');
  });

  it('renders the score', async () => {
    const fixture = await setup('test-match', mockMatch);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('1');
    expect(el.textContent).toContain('0');
  });

  it('shows timeline tab content by default', async () => {
    const fixture = await setup('test-match', mockMatch);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.timeline-panel')).toBeTruthy();
    expect(el.textContent).toContain('Goal! Test Player');
  });

  it('switches to stats tab when clicked', async () => {
    const fixture = await setup('test-match', mockMatch);
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll<HTMLButtonElement>('.tabs button');
    const statsBtn = Array.from(buttons).find((b) => b.textContent?.trim() === 'Stats');
    statsBtn?.click();
    fixture.detectChanges();
    expect(el.querySelector('.stats-panel')).toBeTruthy();
    expect(el.querySelector('.timeline-panel')).toBeFalsy();
  });

  it('switches to lineups tab when clicked', async () => {
    const fixture = await setup('test-match', mockMatch);
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll<HTMLButtonElement>('.tabs button');
    const lineupsBtn = Array.from(buttons).find((b) => b.textContent?.trim() === 'Lineups');
    lineupsBtn?.click();
    fixture.detectChanges();
    expect(el.querySelector('.lineups-panel')).toBeTruthy();
  });

  it('shows fallback message for unknown match id', async () => {
    const fixture = await setup('unknown-id', undefined);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Match not found');
  });
});
