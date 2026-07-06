import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from './settings';

const STORAGE_KEY = 'wc2026-theme';

describe('Settings – theme toggle', () => {
  let fixture: ComponentFixture<Settings>;
  let component: Settings;

  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

    await TestBed.configureTestingModule({
      imports: [Settings],
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('starts in dark mode by default', () => {
    expect(component.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('toggleTheme() switches to light and sets data-theme attribute', () => {
    component.toggleTheme();
    expect(component.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggleTheme() twice returns to dark and removes data-theme attribute', () => {
    component.toggleTheme();
    component.toggleTheme();
    expect(component.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('saves preference to localStorage on toggle', () => {
    component.toggleTheme();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    component.toggleTheme();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('restores light theme from localStorage on init', async () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    document.documentElement.removeAttribute('data-theme');

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [Settings] }).compileComponents();
    const f = TestBed.createComponent(Settings);
    f.detectChanges();

    expect(f.componentInstance.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('renders toggle button in the template', () => {
    const btn = fixture.nativeElement.querySelector('.toggle-btn') as HTMLButtonElement;
    expect(btn).toBeTruthy();
  });

  it('clicking toggle button in template switches theme', () => {
    const btn = fixture.nativeElement.querySelector('.toggle-btn') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();
    expect(component.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
