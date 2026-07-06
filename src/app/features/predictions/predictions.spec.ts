import { TestBed } from '@angular/core/testing';
import { Predictions } from './predictions';
import { DataService } from '../../core/data.service';
import { BracketMatch, BracketRound } from '../../core/models';

const makeTeam = (code: string) => ({
  code, name: code, flag: '🏳️', rank: 1, group: 'A', form: [] as ('W'|'D'|'L')[],
});

const makeMatch = (homeCode: string, awayCode: string, winnerCode?: string): BracketMatch => ({
  home: makeTeam(homeCode),
  away: makeTeam(awayCode),
  homeScore: winnerCode === homeCode ? 2 : 1,
  awayScore: winnerCode === awayCode ? 2 : 1,
  winnerCode,
});

const mockBracket: BracketRound[] = [
  {
    name: 'Round of 32',
    matches: [
      makeMatch('AAA', 'BBB', 'AAA'), // resolved, correct if pick=AAA
      makeMatch('CCC', 'DDD', 'DDD'), // resolved, correct if pick=DDD
      makeMatch('EEE', 'FFF'),         // pending result
    ],
  },
];

describe('Predictions', () => {
  let comp: Predictions;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [Predictions],
      providers: [
        {
          provide: DataService,
          useValue: { bracket: mockBracket, liveMatch: { } },
        },
      ],
    });

    const fixture = TestBed.createComponent(Predictions);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should start with empty picks', () => {
    expect(comp.picks()).toEqual([]);
  });

  it('should load picks from localStorage on init', () => {
    const saved = [{ matchId: 'AAA-BBB', pickedCode: 'AAA' }];
    localStorage.setItem('wc2026-picks', JSON.stringify(saved));

    const fixture2 = TestBed.createComponent(Predictions);
    fixture2.componentInstance.ngOnInit();
    expect(fixture2.componentInstance.picks()).toEqual(saved);
  });

  it('should save pick to localStorage', () => {
    comp.setPick('AAA-BBB', 'AAA');
    const raw = localStorage.getItem('wc2026-picks');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toContainEqual({ matchId: 'AAA-BBB', pickedCode: 'AAA' });
  });

  it('should upsert pick (update existing)', () => {
    comp.setPick('AAA-BBB', 'AAA');
    comp.setPick('AAA-BBB', 'BBB');
    const picks = comp.picks();
    expect(picks.filter(p => p.matchId === 'AAA-BBB')).toHaveLength(1);
    expect(picks.find(p => p.matchId === 'AAA-BBB')?.pickedCode).toBe('BBB');
  });

  it('should count correct picks in score', () => {
    comp.setPick('AAA-BBB', 'AAA'); // correct (winnerCode=AAA)
    comp.setPick('CCC-DDD', 'CCC'); // wrong (winnerCode=DDD)
    expect(comp.score()).toBe(1);
  });

  it('should not count wrong picks in score', () => {
    comp.setPick('AAA-BBB', 'BBB'); // wrong
    comp.setPick('CCC-DDD', 'CCC'); // wrong
    expect(comp.score()).toBe(0);
  });

  it('should count both correct picks when both are right', () => {
    comp.setPick('AAA-BBB', 'AAA'); // correct
    comp.setPick('CCC-DDD', 'DDD'); // correct
    expect(comp.score()).toBe(2);
  });

  it('should not count pending match (no winnerCode) in score regardless of pick', () => {
    comp.setPick('EEE-FFF', 'EEE');
    expect(comp.score()).toBe(0);
  });

  it('should count pending picks (pick exists but no winnerCode yet)', () => {
    comp.setPick('EEE-FFF', 'EEE');
    expect(comp.pending()).toBe(1);
  });

  it('should not count resolved matches in pending', () => {
    comp.setPick('AAA-BBB', 'AAA'); // resolved match
    expect(comp.pending()).toBe(0);
  });

  it('should return correct matchId', () => {
    const match = mockBracket[0].matches[0];
    expect(comp.matchId(match)).toBe('AAA-BBB');
  });

  it('should return undefined getPick for unpicked match', () => {
    expect(comp.getPick('AAA-BBB')).toBeUndefined();
  });

  it('should return pickedCode from getPick after picking', () => {
    comp.setPick('AAA-BBB', 'AAA');
    expect(comp.getPick('AAA-BBB')).toBe('AAA');
  });
});
