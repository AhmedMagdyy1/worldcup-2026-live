import { Routes } from '@angular/router';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'live' },
      {
        path: 'live',
        loadComponent: () => import('./features/live/live').then((m) => m.Live),
      },
      {
        path: 'standings',
        loadComponent: () => import('./features/standings/standings').then((m) => m.Standings),
      },
      {
        path: 'teams',
        loadChildren: () => import('./features/teams/teams.routes').then((m) => m.TEAMS_ROUTES),
      },
      {
        path: 'predictions',
        loadComponent: () => import('./features/predictions/predictions').then((m) => m.Predictions),
      },
      {
        path: 'schedule',
        loadComponent: () => import('./features/schedule/schedule').then((m) => m.Schedule),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      { path: '**', redirectTo: 'live' },
    ],
  },
];
