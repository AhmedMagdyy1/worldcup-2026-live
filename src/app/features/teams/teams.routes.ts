import { Routes } from '@angular/router';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./team-list/team-list').then((m) => m.TeamList),
  },
  {
    path: ':code',
    loadComponent: () => import('./team-detail/team-detail').then((m) => m.TeamDetail),
  },
];
