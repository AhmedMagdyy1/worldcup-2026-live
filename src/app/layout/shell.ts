import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  readonly topNav = [
    { path: '/live', label: 'Live' },
    { path: '/standings', label: 'Groups' },
    { path: '/teams', label: 'Teams' },
    { path: '/schedule', label: 'Schedule' },
  ];

  readonly sideNav = [
    { path: '/live', label: 'Live Center', icon: '🛰' },
    { path: '/standings', label: 'Standings', icon: '📊' },
    { path: '/predictions', label: 'Predictions', icon: '🧭' },
    { path: '/teams', label: 'Squads', icon: '👥' },
    { path: '/settings', label: 'Settings', icon: '⚙' },
  ];

  readonly bottomNav = [
    { path: '/live', label: 'Live', icon: '⚽' },
    { path: '/standings', label: 'Groups', icon: '☰' },
    { path: '/predictions', label: 'Predict', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '◉' },
  ];
}
