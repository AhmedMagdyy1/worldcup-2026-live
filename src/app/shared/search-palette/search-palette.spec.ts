import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SearchPaletteComponent } from './search-palette';
import { DataService } from '../../core/data.service';
import { Team } from '../../core/models';

const MOCK_TEAMS: Team[] = [
  { code: 'USA', name: 'United States', flag: '🇺🇸', group: 'A', rank: 1, form: [] },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽', group: 'A', rank: 2, form: [] },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷', group: 'B', rank: 3, form: [] },
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'B', rank: 4, form: [] },
];

const mockDataService = {
  allTeams: () => MOCK_TEAMS,
};

function setup() {
  TestBed.configureTestingModule({
    imports: [SearchPaletteComponent],
    providers: [
      provideRouter([]),
      { provide: DataService, useValue: mockDataService },
    ],
  });
  const fixture = TestBed.createComponent(SearchPaletteComponent);
  fixture.detectChanges();
  return fixture;
}

describe('SearchPaletteComponent', () => {
  it('shows all teams when query is empty', () => {
    const fixture = setup();
    const rows = fixture.debugElement.queryAll(By.css('.result-row'));
    expect(rows.length).toBe(4);
  });

  it('filters by team name (case-insensitive)', () => {
    const fixture = setup();
    const comp = fixture.componentInstance;
    comp.onQueryChange('braz');
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.result-row'));
    expect(rows.length).toBe(1);
    expect(rows[0].nativeElement.textContent).toContain('Brazil');
  });

  it('filters by team code (case-insensitive)', () => {
    const fixture = setup();
    const comp = fixture.componentInstance;
    comp.onQueryChange('arg');
    fixture.detectChanges();
    const rows = fixture.debugElement.queryAll(By.css('.result-row'));
    expect(rows.length).toBe(1);
    expect(rows[0].nativeElement.textContent).toContain('Argentina');
  });

  it('shows empty state when no teams match', () => {
    const fixture = setup();
    const comp = fixture.componentInstance;
    comp.onQueryChange('zzzzz');
    fixture.detectChanges();
    const empty = fixture.debugElement.query(By.css('.palette-empty'));
    expect(empty).toBeTruthy();
    expect(empty.nativeElement.textContent).toContain('No teams found');
    const rows = fixture.debugElement.queryAll(By.css('.result-row'));
    expect(rows.length).toBe(0);
  });

  it('emits close on ESC key', () => {
    const fixture = setup();
    const comp = fixture.componentInstance;
    const closeSpy = vi.fn();
    comp.close.subscribe(closeSpy);
    comp.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('resets activeIndex to 0 on query change', () => {
    const fixture = setup();
    const comp = fixture.componentInstance;
    comp.activeIndex.set(2);
    comp.onQueryChange('mex');
    expect(comp.activeIndex()).toBe(0);
  });

  it('increments activeIndex on ArrowDown', () => {
    const fixture = setup();
    const comp = fixture.componentInstance;
    comp.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(comp.activeIndex()).toBe(1);
  });

  it('does not decrement activeIndex below 0 on ArrowUp', () => {
    const fixture = setup();
    const comp = fixture.componentInstance;
    comp.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(comp.activeIndex()).toBe(0);
  });
});
