import { TestBed } from '@angular/core/testing';
import { DataService } from '../../core/data.service';
import { ScheduleFixture } from '../../core/models';
import { Schedule } from './schedule';
import { describe, it, expect, beforeEach } from 'vitest';

describe('DataService.getFixtures()', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('returns 72 group-stage fixtures (12 groups × 3 rounds × 2 matches)', () => {
    const fixtures = service.getFixtures();
    expect(fixtures.length).toBe(72);
  });

  it('all fixtures have a valid group label (A-L)', () => {
    const valid = new Set(['A','B','C','D','E','F','G','H','I','J','K','L']);
    const fixtures = service.getFixtures();
    for (const f of fixtures) {
      expect(valid.has(f.group)).toBe(true);
    }
  });

  it('returns fixtures sorted by date ascending', () => {
    const fixtures = service.getFixtures();
    for (let i = 1; i < fixtures.length; i++) {
      expect(fixtures[i].date.getTime()).toBeGreaterThanOrEqual(fixtures[i - 1].date.getTime());
    }
  });

  it('each group has exactly 6 fixtures (3 rounds × 2 matches)', () => {
    const fixtures = service.getFixtures();
    const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
    for (const g of groups) {
      const gf = fixtures.filter((f) => f.group === g);
      expect(gf.length).toBe(6);
    }
  });
});

describe('Schedule component filters', () => {
  let component: Schedule;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Schedule] });
    const fixture = TestBed.createComponent(Schedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('filter by group A returns only group A fixtures', () => {
    component.setGroup('A');
    const filtered = component.filteredFixtures();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((f) => f.group === 'A')).toBe(true);
  });

  it('filter by group L returns only group L fixtures', () => {
    component.setGroup('L');
    const filtered = component.filteredFixtures();
    expect(filtered.every((f) => f.group === 'L')).toBe(true);
  });

  it('filter by status "finished" returns only finished fixtures', () => {
    component.setStatus('finished');
    const filtered = component.filteredFixtures();
    if (filtered.length > 0) {
      expect(filtered.every((f) => f.status === 'finished')).toBe(true);
    }
  });

  it('filter by status "upcoming" returns only upcoming fixtures', () => {
    component.setStatus('upcoming');
    const filtered = component.filteredFixtures();
    if (filtered.length > 0) {
      expect(filtered.every((f) => f.status === 'upcoming')).toBe(true);
    }
  });

  it('"all" filter returns all 72 fixtures', () => {
    component.setGroup('all');
    component.setStatus('all');
    expect(component.filteredFixtures().length).toBe(72);
  });

  it('combined group + status filter works correctly', () => {
    component.setGroup('B');
    component.setStatus('finished');
    const filtered = component.filteredFixtures();
    expect(filtered.every((f) => f.group === 'B' && f.status === 'finished')).toBe(true);
  });

  it('fixturesByDate groups fixtures by date', () => {
    component.setGroup('A');
    component.setStatus('all');
    const byDate = component.fixturesByDate();
    expect(byDate.length).toBeGreaterThan(0);
    for (const group of byDate) {
      expect(group.fixtures.length).toBeGreaterThan(0);
      expect(typeof group.label).toBe('string');
    }
  });
});
