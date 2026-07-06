import { TestBed } from '@angular/core/testing';
import { Standings } from './standings';

describe('Standings filter', () => {
  let component: Standings;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Standings] });
    component = TestBed.createComponent(Standings).componentInstance;
  });

  it('shows all 12 groups by default', () => {
    expect(component.groups.length).toBe(12);
  });

  it('filters to groups A-D', () => {
    component.filter.set('ad');
    expect(component.groups.map((g) => g.name)).toEqual(['Group A', 'Group B', 'Group C', 'Group D']);
  });

  it('filters to groups E-H', () => {
    component.filter.set('eh');
    expect(component.groups.map((g) => g.name)).toEqual(['Group E', 'Group F', 'Group G', 'Group H']);
  });

  it('filters to groups I-L', () => {
    component.filter.set('il');
    expect(component.groups.map((g) => g.name)).toEqual(['Group I', 'Group J', 'Group K', 'Group L']);
  });

  it('returns to all 12 groups when filter is reset to all', () => {
    component.filter.set('ad');
    component.filter.set('all');
    expect(component.groups.length).toBe(12);
  });
});
