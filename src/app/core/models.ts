export interface Team {
  code: string;
  name: string;
  flag: string;
  rank: number;
  group: string;
  form: ('W' | 'D' | 'L')[];
}

export interface TimelineEvent {
  minute: string;
  type: 'goal' | 'card' | 'sub' | 'half' | 'whistle';
  team: 'home' | 'away';
  title: string;
  detail: string;
}

export interface MatchStats {
  possession: [number, number];
  shotsOnTarget: [number, number];
  xg: [number, number];
  shots: [number, number];
}

export interface Match {
  id: string;
  group: string;
  stadium: string;
  crowd?: number;
  kickoff: string;
  status: 'live' | 'upcoming' | 'finished';
  minute?: number;
  home: Team;
  away: Team;
  homeScore: number;
  awayScore: number;
  stats: MatchStats;
  timeline: TimelineEvent[];
  winProb: [number, number, number]; // home / draw / away
}

export interface StandingRow {
  pos: number;
  team: Team;
  played: number;
  gd: number;
  pts: number;
}

export interface Group {
  name: string;
  status: string;
  rows: StandingRow[];
}

export interface Player {
  number: number;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  club: string;
  rating: number;
  goals?: number;
  apps?: number;
  xg?: number;
}

export interface StoryItem {
  tag: string;
  title: string;
  time: string;
}
