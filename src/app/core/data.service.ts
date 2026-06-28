import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';
import { Group, Match, Player, StoryItem, Team } from './models';

const teams: Record<string, Team> = {
  MEX: { code: 'MEX', name: 'Mexico', flag: '🇲🇽', rank: 15, group: 'C', form: ['W', 'W', 'D', 'W', 'L'] },
  ITA: { code: 'ITA', name: 'Italy', flag: '🇮🇹', rank: 7, group: 'C', form: ['W', 'L', 'W', 'D', 'W'] },
  ARG: { code: 'ARG', name: 'Argentina', flag: '🇦🇷', rank: 1, group: 'A', form: ['W', 'W', 'D', 'W', 'L'] },
  NED: { code: 'NED', name: 'Netherlands', flag: '🇳🇱', rank: 8, group: 'A', form: ['W', 'D', 'W', 'L', 'W'] },
  USA: { code: 'USA', name: 'USA', flag: '🇺🇸', rank: 11, group: 'B', form: ['D', 'W', 'W', 'D', 'L'] },
  JPN: { code: 'JPN', name: 'Japan', flag: '🇯🇵', rank: 17, group: 'B', form: ['W', 'L', 'D', 'W', 'W'] },
  FRA: { code: 'FRA', name: 'France', flag: '🇫🇷', rank: 2, group: 'C', form: ['W', 'W', 'W', 'D', 'W'] },
  BRA: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', rank: 3, group: 'B', form: ['W', 'W', 'D', 'W', 'W'] },
  ENG: { code: 'ENG', name: 'England', flag: '🏴', rank: 4, group: 'A', form: ['W', 'W', 'W', 'L', 'D'] },
  SEN: { code: 'SEN', name: 'Senegal', flag: '🇸🇳', rank: 19, group: 'A', form: ['L', 'D', 'L', 'W', 'D'] },
  CAN: { code: 'CAN', name: 'Canada', flag: '🇨🇦', rank: 14, group: 'A', form: ['W', 'W', 'W', 'D', 'W'] },
  ESP: { code: 'ESP', name: 'Spain', flag: '🇪🇸', rank: 6, group: 'A', form: ['W', 'D', 'W', 'W', 'L'] },
  GHA: { code: 'GHA', name: 'Ghana', flag: '🇬🇭', rank: 28, group: 'A', form: ['L', 'L', 'D', 'L', 'W'] },
  AUS: { code: 'AUS', name: 'Australia', flag: '🇦🇺', rank: 24, group: 'A', form: ['L', 'L', 'L', 'D', 'L'] },
  CRO: { code: 'CRO', name: 'Croatia', flag: '🇭🇷', rank: 9, group: 'B', form: ['D', 'W', 'L', 'D', 'W'] },
  GER: { code: 'GER', name: 'Germany', flag: '🇩🇪', rank: 13, group: 'C', form: ['D', 'W', 'L', 'W', 'D'] },
  MAR: { code: 'MAR', name: 'Morocco', flag: '🇲🇦', rank: 12, group: 'C', form: ['D', 'L', 'D', 'W', 'D'] },
};

const players: Record<string, Player[]> = {
  ARG: [
    { number: 10, name: 'Lionel Messi', position: 'FWD', club: 'Inter Miami', rating: 9.2, goals: 106, apps: 180, xg: 0.82 },
    { number: 22, name: 'Lautaro Martínez', position: 'FWD', club: 'Inter Milan', rating: 8.1, goals: 32, apps: 56, xg: 0.65 },
    { number: 9, name: 'Julián Álvarez', position: 'FWD', club: 'Man City', rating: 7.9, goals: 7, apps: 28, xg: 0.44 },
    { number: 20, name: 'Alexis Mac Allister', position: 'MID', club: 'Liverpool', rating: 7.8, goals: 0, apps: 0 },
    { number: 24, name: 'Enzo Fernández', position: 'MID', club: 'Chelsea', rating: 7.6, goals: 0, apps: 0 },
    { number: 7, name: 'Rodrigo De Paul', position: 'MID', club: 'Atl. Madrid', rating: 7.5, goals: 0, apps: 0 },
    { number: 23, name: 'Emiliano Martínez', position: 'GK', club: 'Aston Villa', rating: 8.5, goals: 0, apps: 0 },
  ],
};

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly liveMatch = signal<Match>({
    id: 'mex-ita',
    group: 'Group C',
    stadium: 'Aztec Arena',
    crowd: 87500,
    kickoff: '20:00 EST',
    status: 'live',
    minute: 74,
    home: teams['MEX'],
    away: teams['ITA'],
    homeScore: 2,
    awayScore: 1,
    stats: { possession: [54, 46], shotsOnTarget: [6, 4], xg: [1.84, 1.12], shots: [12, 8] },
    winProb: [72, 18, 10],
    timeline: [
      { minute: '74\'', type: 'card', team: 'away', title: 'Red Card · L. Bonucci', detail: 'Dangerous foul on H. Lozano' },
      { minute: '62\'', type: 'goal', team: 'home', title: 'Goal Mexico! Santiago Giménez', detail: 'Assist by Edson Álvarez' },
      { minute: '55\'', type: 'sub', team: 'away', title: 'Substitution (ITA)', detail: 'Retegui ↓  Scamacca ↑' },
      { minute: 'HT', type: 'half', team: 'home', title: 'Half Time Whistle', detail: '' },
      { minute: '42\'', type: 'card', team: 'away', title: 'Yellow Card · Nicolò Barella', detail: 'Foul on Edson Álvarez' },
      { minute: '31\'', type: 'goal', team: 'away', title: 'Goal! Federico Chiesa', detail: 'Solo effort after counter-attack' },
    ],
  });

  readonly upcomingToday: Match[] = [
    {
      id: 'usa-jpn', group: 'Group B', stadium: 'Sofi Stadium, LA', kickoff: '18:00', status: 'upcoming',
      home: teams['USA'], away: teams['JPN'], homeScore: 0, awayScore: 0,
      stats: { possession: [50, 50], shotsOnTarget: [0, 0], xg: [0, 0], shots: [0, 0] }, winProb: [40, 30, 30], timeline: [],
    },
    {
      id: 'bra-fra', group: 'Group C', stadium: 'MetLife Stadium, NY', kickoff: '21:00', status: 'upcoming',
      home: teams['BRA'], away: teams['FRA'], homeScore: 0, awayScore: 0,
      stats: { possession: [50, 50], shotsOnTarget: [0, 0], xg: [0, 0], shots: [0, 0] }, winProb: [38, 24, 38], timeline: [],
    },
  ];

  readonly completedMatches: Match[] = [
    {
      id: 'arg-gha', group: 'Group A', stadium: 'Lusail Stadium', kickoff: 'FT', status: 'finished',
      home: teams['ARG'], away: teams['GHA'], homeScore: 3, awayScore: 0,
      stats: { possession: [61, 39], shotsOnTarget: [9, 2], xg: [2.4, 0.5], shots: [15, 5] }, winProb: [100, 0, 0], timeline: [],
    },
    {
      id: 'eng-sen', group: 'Group A', stadium: 'SoFi Stadium', kickoff: 'FT', status: 'finished',
      home: teams['ENG'], away: teams['SEN'], homeScore: 3, awayScore: 0,
      stats: { possession: [58, 42], shotsOnTarget: [8, 3], xg: [2.1, 0.6], shots: [13, 6] }, winProb: [100, 0, 0], timeline: [],
    },
  ];

  readonly groups: Group[] = [
    {
      name: 'Group A', status: 'Live Update',
      rows: [
        { pos: 1, team: teams['USA'], played: 3, gd: 5, pts: 9 },
        { pos: 2, team: teams['CAN'], played: 3, gd: 2, pts: 6 },
        { pos: 3, team: teams['GHA'], played: 3, gd: -3, pts: 3 },
        { pos: 4, team: teams['AUS'], played: 3, gd: -4, pts: 0 },
      ],
    },
    {
      name: 'Group B', status: 'Final Standings',
      rows: [
        { pos: 1, team: teams['BRA'], played: 3, gd: 7, pts: 9 },
        { pos: 2, team: teams['FRA'], played: 3, gd: 4, pts: 6 },
        { pos: 3, team: teams['JPN'], played: 3, gd: -3, pts: 3 },
        { pos: 4, team: teams['CRO'], played: 3, gd: -8, pts: 0 },
      ],
    },
    {
      name: 'Group C', status: 'Live Match: 65\'',
      rows: [
        { pos: 1, team: teams['ARG'], played: 2, gd: 3, pts: 6 },
        { pos: 2, team: teams['GER'], played: 2, gd: 1, pts: 4 },
        { pos: 3, team: teams['MAR'], played: 2, gd: 0, pts: 1 },
        { pos: 4, team: teams['AUS'], played: 2, gd: -4, pts: 0 },
      ],
    },
    {
      name: 'Group D', status: 'Awaiting Kickoff',
      rows: [
        { pos: 1, team: teams['ESP'], played: 0, gd: 0, pts: 0 },
        { pos: 2, team: teams['ENG'], played: 0, gd: 0, pts: 0 },
        { pos: 3, team: teams['USA'], played: 0, gd: 0, pts: 0 },
        { pos: 4, team: teams['SEN'], played: 0, gd: 0, pts: 0 },
      ],
    },
  ];

  readonly stories: StoryItem[] = [
    { tag: 'BREAKING', title: 'Mbappé fitness concerns grow ahead of Brazil clash', time: '12m ago' },
    { tag: 'TOURNAMENT', title: "Los Angeles prepares for the 'Match of the Century'", time: '1h ago' },
  ];

  getTeam(code: string): Team | undefined {
    return teams[code];
  }

  getSquad(code: string): Player[] {
    return players[code] ?? [];
  }

  allTeams(): Team[] {
    return Object.values(teams);
  }

  /** Simulated live-data ticking: minute clock + small possession/xg drift. */
  startLiveTicker() {
    return interval(5000).subscribe(() => {
      const m = this.liveMatch();
      if (m.status !== 'live') return;
      const drift = Math.random() > 0.5 ? 1 : -1;
      const [hp, ap] = m.stats.possession;
      const nextHp = Math.min(70, Math.max(30, hp + drift));
      this.liveMatch.set({
        ...m,
        minute: Math.min(90, (m.minute ?? 0) + 1),
        stats: { ...m.stats, possession: [nextHp, 100 - nextHp] },
      });
    });
  }
}
