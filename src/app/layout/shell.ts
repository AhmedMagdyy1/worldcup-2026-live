import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SearchPaletteComponent } from '../shared/search-palette/search-palette';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SearchPaletteComponent],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  showSearch = signal(false);

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.showSearch.set(true);
    }
  }

  readonly topNav = [
    { path: '/live', label: 'Live' },
    { path: '/standings', label: 'Groups' },
    { path: '/teams', label: 'Teams' },
    { path: '/bracket', label: 'Bracket' },
    { path: '/schedule', label: 'Schedule' },
  ];

  readonly sideNav = [
    { path: '/live', label: 'Live Center', icon: '🛰' },
    { path: '/standings', label: 'Standings', icon: '📊' },
    { path: '/bracket', label: 'Bracket', icon: '🏆' },
    { path: '/predictions', label: 'Predictions', icon: '🧭' },
    { path: '/teams', label: 'Squads', icon: '👥' },
    { path: '/compare', label: 'Compare', icon: '⚖️' },
    { path: '/settings', label: 'Settings', icon: '⚙' },
  ];

  readonly bottomNav = [
    { path: '/live', label: 'Live', icon: '⚽' },
    { path: '/standings', label: 'Groups', icon: '☰' },
    { path: '/bracket', label: 'Bracket', icon: '🏆' },
    { path: '/predictions', label: 'Predict', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '◉' },
  ];
}
