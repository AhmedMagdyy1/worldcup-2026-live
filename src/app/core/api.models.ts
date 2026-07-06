// ESPN API response interfaces

export interface EspnTeam {
  id: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  logos?: { href: string }[];
}

export interface EspnStat {
  name: string;
  value: number;
  displayValue: string;
}

export interface EspnStandingsEntry {
  team: EspnTeam;
  stats: EspnStat[];
  note?: { rank: number; description: string };
}

export interface EspnStandingsGroup {
  uid: string;
  id: string;
  name: string;
  abbreviation: string;
  standings: {
    entries: EspnStandingsEntry[];
    season: number;
    seasonDisplayName: string;
  };
}

export interface EspnStandingsResponse {
  id: string;
  name: string;
  children: EspnStandingsGroup[];
}

// Scoreboard interfaces

export interface EspnCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  team: EspnTeam;
  score?: string;
}

export interface EspnStatusType {
  name: string;
  shortDetail: string;
  completed: boolean;
}

export interface EspnStatus {
  displayClock: string;
  period: number;
  type: EspnStatusType;
}

export interface EspnCompetition {
  id: string;
  competitors: EspnCompetitor[];
  status: EspnStatus;
  venue?: { fullName: string };
}

export interface EspnEvent {
  id: string;
  name: string;
  date: string;
  competitions: EspnCompetition[];
  status: EspnStatus;
}

export interface EspnScoreboardResponse {
  events: EspnEvent[];
}
