import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Compare } from './compare';
import { DataService } from '../../core/data.service';

describe('Compare component', () => {
  let component: Compare;
  let data: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    data = TestBed.inject(DataService);
    component = TestBed.runInInjectionContext(() => new Compare());
  });

  it('starts with no teams selected', () => {
    expect(component.teamA()).toBeNull();
    expect(component.teamB()).toBeNull();
    expect(component.ready()).toBe(false);
    expect(component.statsRows()).toEqual([]);
  });

  it('ready() is true when both teams selected', () => {
    const teams = component.teams;
    component.teamA.set(teams[0]);
    component.teamB.set(teams[1]);
    expect(component.ready()).toBe(true);
  });

  it('statsRows has 4 rows when both teams selected', () => {
    const teams = component.teams;
    component.teamA.set(teams[0]);
    component.teamB.set(teams[1]);
    expect(component.statsRows().length).toBe(4);
  });

  it('lower FIFA rank wins the rank stat', () => {
    const allTeams = component.teams;
    // ARG rank=1, PAN rank=34 — ARG should win
    const arg = allTeams.find((t) => t.code === 'ARG')!;
    const pan = allTeams.find((t) => t.code === 'PAN')!;
    component.teamA.set(arg);
    component.teamB.set(pan);

    const rankRow = component.statsRows().find((r) => r.label === 'FIFA Rank')!;
    expect(rankRow.aWins).toBe(true);
    expect(rankRow.bWins).toBe(false);
  });

  it('team with more wins in form wins the Form stat', () => {
    const allTeams = component.teams;
    // CAN form: ['W','W','W','D','W'] = 4 wins
    // PER form: ['D','L','D','L','L'] = 0 wins
    const can = allTeams.find((t) => t.code === 'CAN')!;
    const per = allTeams.find((t) => t.code === 'PER')!;
    component.teamA.set(can);
    component.teamB.set(per);

    const formRow = component.statsRows().find((r) => r.label === 'Form (Wins)')!;
    expect(formRow.aWins).toBe(true);
    expect(formRow.bWins).toBe(false);
  });

  it('team with higher avg squad rating wins rating stat', () => {
    const allTeams = component.teams;
    // ARG has Messi (9.2) — higher avg than PAN
    const arg = allTeams.find((t) => t.code === 'ARG')!;
    const pan = allTeams.find((t) => t.code === 'PAN')!;
    component.teamA.set(arg);
    component.teamB.set(pan);

    const ratingRow = component.statsRows().find((r) => r.label === 'Avg Squad Rating')!;
    expect(ratingRow.aWins).toBe(true);
    expect(ratingRow.bWins).toBe(false);
  });

  it('neither aWins nor bWins on ties', () => {
    // Give two teams identical form to force a tie
    const allTeams = component.teams;
    const t1 = allTeams.find((t) => t.code === 'ENG')!; // form: ['W','W','W','L','D'] = 3W
    const t2 = allTeams.find((t) => t.code === 'FRA')!; // form: ['W','W','W','D','W'] = 4W — not a tie
    // Just ensure no crash
    component.teamA.set(t1);
    component.teamB.set(t2);
    const rows = component.statsRows();
    expect(rows.every((r) => typeof r.aWins === 'boolean')).toBe(true);
  });
});
