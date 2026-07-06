import { Component, OnInit, signal } from '@angular/core';

const STORAGE_KEY = 'wc2026-theme';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  theme = signal<'dark' | 'light'>('dark');

  ngOnInit(): void {
    const stored = localStorage.getItem(STORAGE_KEY) as 'dark' | 'light' | null;
    if (stored === 'light' || stored === 'dark') {
      this.theme.set(stored);
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem(STORAGE_KEY, next);
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.theme() === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
