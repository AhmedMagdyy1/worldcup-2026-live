import { Injectable, inject, signal } from '@angular/core';
import { Observable, interval, of } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { BracketMatch, BracketRound, BracketTeam, Group, Match, Player, ScheduleFixture, StandingRow, StoryItem, Team, TimelineEvent } from './models';
import { ApiService } from './api.service';
import { EspnStandingsResponse } from './api.models';

const teams: Record<string, Team> = {
  // Group A
  USA: { code: 'USA', name: 'USA', flag: '🇺🇸', rank: 11, group: 'A', form: ['D', 'W', 'W', 'D', 'L'] },
  MEX: { code: 'MEX', name: 'Mexico', flag: '🇲🇽', rank: 15, group: 'A', form: ['W', 'W', 'D', 'W', 'L'] },
  CAN: { code: 'CAN', name: 'Canada', flag: '🇨🇦', rank: 14, group: 'A', form: ['W', 'W', 'W', 'D', 'W'] },
  PAN: { code: 'PAN', name: 'Panama', flag: '🇵🇦', rank: 34, group: 'A', form: ['L', 'D', 'L', 'D', 'W'] },
  // Group B
  ARG: { code: 'ARG', name: 'Argentina', flag: '🇦🇷', rank: 1, group: 'B', form: ['W', 'W', 'D', 'W', 'L'] },
  NED: { code: 'NED', name: 'Netherlands', flag: '🇳🇱', rank: 8, group: 'B', form: ['W', 'D', 'W', 'L', 'W'] },
  CHI: { code: 'CHI', name: 'Chile', flag: '🇨🇱', rank: 31, group: 'B', form: ['L', 'D', 'D', 'L', 'D'] },
  PER: { code: 'PER', name: 'Peru', flag: '🇵🇪', rank: 33, group: 'B', form: ['D', 'L', 'D', 'L', 'L'] },
  // Group C
  FRA: { code: 'FRA', name: 'France', flag: '🇫🇷', rank: 2, group: 'C', form: ['W', 'W', 'W', 'D', 'W'] },
  ITA: { code: 'ITA', name: 'Italy', flag: '🇮🇹', rank: 7, group: 'C', form: ['W', 'L', 'W', 'D', 'W'] },
  GER: { code: 'GER', name: 'Germany', flag: '🇩🇪', rank: 13, group: 'C', form: ['D', 'W', 'L', 'W', 'D'] },
  MAR: { code: 'MAR', name: 'Morocco', flag: '🇲🇦', rank: 12, group: 'C', form: ['D', 'L', 'D', 'W', 'D'] },
  // Group D
  BRA: { code: 'BRA', name: 'Brazil', flag: '🇧🇷', rank: 3, group: 'D', form: ['W', 'W', 'D', 'W', 'W'] },
  JPN: { code: 'JPN', name: 'Japan', flag: '🇯🇵', rank: 17, group: 'D', form: ['W', 'L', 'D', 'W', 'W'] },
  CRO: { code: 'CRO', name: 'Croatia', flag: '🇭🇷', rank: 9, group: 'D', form: ['D', 'W', 'L', 'D', 'W'] },
  TUN: { code: 'TUN', name: 'Tunisia', flag: '🇹🇳', rank: 30, group: 'D', form: ['L', 'D', 'L', 'D', 'D'] },
  // Group E
  ENG: { code: 'ENG', name: 'England', flag: '🏴', rank: 4, group: 'E', form: ['W', 'W', 'W', 'L', 'D'] },
  SEN: { code: 'SEN', name: 'Senegal', flag: '🇸🇳', rank: 19, group: 'E', form: ['L', 'D', 'L', 'W', 'D'] },
  IRN: { code: 'IRN', name: 'Iran', flag: '🇮🇷', rank: 22, group: 'E', form: ['D', 'D', 'L', 'W', 'L'] },
  QAT: { code: 'QAT', name: 'Qatar', flag: '🇶🇦', rank: 38, group: 'E', form: ['L', 'L', 'D', 'L', 'D'] },
  // Group F
  ESP: { code: 'ESP', name: 'Spain', flag: '🇪🇸', rank: 6, group: 'F', form: ['W', 'D', 'W', 'W', 'L'] },
  AUS: { code: 'AUS', name: 'Australia', flag: '🇦🇺', rank: 24, group: 'F', form: ['L', 'L', 'L', 'D', 'L'] },
  GHA: { code: 'GHA', name: 'Ghana', flag: '🇬🇭', rank: 28, group: 'F', form: ['L', 'L', 'D', 'L', 'W'] },
  KOR: { code: 'KOR', name: 'Korea Rep.', flag: '🇰🇷', rank: 16, group: 'F', form: ['D', 'W', 'D', 'L', 'D'] },
  // Group G
  POR: { code: 'POR', name: 'Portugal', flag: '🇵🇹', rank: 5, group: 'G', form: ['W', 'W', 'D', 'W', 'W'] },
  BEL: { code: 'BEL', name: 'Belgium', flag: '🇧🇪', rank: 10, group: 'G', form: ['D', 'W', 'W', 'L', 'D'] },
  KSA: { code: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦', rank: 27, group: 'G', form: ['L', 'D', 'L', 'D', 'L'] },
  ECU: { code: 'ECU', name: 'Ecuador', flag: '🇪🇨', rank: 25, group: 'G', form: ['D', 'L', 'D', 'D', 'W'] },
  // Group H
  URU: { code: 'URU', name: 'Uruguay', flag: '🇺🇾', rank: 18, group: 'H', form: ['W', 'D', 'W', 'L', 'D'] },
  COL: { code: 'COL', name: 'Colombia', flag: '🇨🇴', rank: 20, group: 'H', form: ['D', 'W', 'D', 'W', 'L'] },
  SUI: { code: 'SUI', name: 'Switzerland', flag: '🇨🇭', rank: 21, group: 'H', form: ['W', 'D', 'L', 'D', 'W'] },
  CMR: { code: 'CMR', name: 'Cameroon', flag: '🇨🇲', rank: 35, group: 'H', form: ['L', 'D', 'L', 'L', 'D'] },
  // Group I
  CRC: { code: 'CRC', name: 'Costa Rica', flag: '🇨🇷', rank: 32, group: 'I', form: ['D', 'L', 'D', 'L', 'D'] },
  JAM: { code: 'JAM', name: 'Jamaica', flag: '🇯🇲', rank: 44, group: 'I', form: ['L', 'L', 'D', 'L', 'L'] },
  SRB: { code: 'SRB', name: 'Serbia', flag: '🇷🇸', rank: 23, group: 'I', form: ['W', 'D', 'L', 'W', 'D'] },
  POL: { code: 'POL', name: 'Poland', flag: '🇵🇱', rank: 26, group: 'I', form: ['D', 'D', 'W', 'L', 'D'] },
  // Group J
  WAL: { code: 'WAL', name: 'Wales', flag: '🏴', rank: 29, group: 'J', form: ['L', 'D', 'D', 'L', 'D'] },
  DEN: { code: 'DEN', name: 'Denmark', flag: '🇩🇰', rank: 16, group: 'J', form: ['D', 'W', 'D', 'W', 'D'] },
  RSA: { code: 'RSA', name: 'South Africa', flag: '🇿🇦', rank: 40, group: 'J', form: ['L', 'L', 'D', 'D', 'L'] },
  NGA: { code: 'NGA', name: 'Nigeria', flag: '🇳🇬', rank: 36, group: 'J', form: ['D', 'L', 'L', 'D', 'L'] },
  // Group K
  AUT: { code: 'AUT', name: 'Austria', flag: '🇦🇹', rank: 22, group: 'K', form: ['W', 'D', 'W', 'D', 'L'] },
  SCO: { code: 'SCO', name: 'Scotland', flag: '🏴', rank: 39, group: 'K', form: ['L', 'D', 'L', 'D', 'D'] },
  EGY: { code: 'EGY', name: 'Egypt', flag: '🇪🇬', rank: 33, group: 'K', form: ['D', 'L', 'D', 'L', 'D'] },
  CIV: { code: 'CIV', name: "Côte d'Ivoire", flag: '🇨🇮', rank: 41, group: 'K', form: ['L', 'D', 'L', 'L', 'D'] },
  // Group L
  TUR: { code: 'TUR', name: 'Turkey', flag: '🇹🇷', rank: 19, group: 'L', form: ['W', 'D', 'W', 'D', 'W'] },
  UKR: { code: 'UKR', name: 'Ukraine', flag: '🇺🇦', rank: 28, group: 'L', form: ['D', 'L', 'D', 'D', 'L'] },
  PAR: { code: 'PAR', name: 'Paraguay', flag: '🇵🇾', rank: 42, group: 'L', form: ['L', 'L', 'D', 'L', 'D'] },
  VEN: { code: 'VEN', name: 'Venezuela', flag: '🇻🇪', rank: 45, group: 'L', form: ['L', 'L', 'L', 'D', 'L'] },
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
  USA: [
    { number: 10, name: 'Christian Pulisic', position: 'FWD', club: 'AC Milan', rating: 8.0, goals: 31, apps: 71, xg: 0.5 },
    { number: 9, name: 'Folarin Balogun', position: 'FWD', club: 'Monaco', rating: 7.3, goals: 6, apps: 15, xg: 0.4 },
    { number: 17, name: 'Tim Weah', position: 'MID', club: 'Juventus', rating: 7.2, goals: 0, apps: 0 },
    { number: 6, name: 'Yunus Musah', position: 'MID', club: 'Atalanta', rating: 7.1, goals: 0, apps: 0 },
    { number: 4, name: 'Tyler Adams', position: 'MID', club: 'Bournemouth', rating: 7.4, goals: 0, apps: 0 },
    { number: 3, name: 'Chris Richards', position: 'DEF', club: 'Crystal Palace', rating: 7.0, goals: 0, apps: 0 },
    { number: 1, name: 'Matt Turner', position: 'GK', club: 'Crystal Palace', rating: 7.2, goals: 0, apps: 0 },
  ],
  MEX: [
    { number: 7, name: 'Santiago Giménez', position: 'FWD', club: 'AC Milan', rating: 8.0, goals: 11, apps: 23, xg: 0.6 },
    { number: 11, name: 'Hirving Lozano', position: 'FWD', club: 'Real Betis', rating: 7.6, goals: 19, apps: 70, xg: 0.45 },
    { number: 22, name: 'Uriel Antuna', position: 'FWD', club: 'Cruz Azul', rating: 7.1, goals: 0, apps: 0 },
    { number: 17, name: 'Edson Álvarez', position: 'MID', club: 'Fenerbahçe', rating: 7.8, goals: 0, apps: 0 },
    { number: 5, name: 'Erick Sánchez', position: 'MID', club: 'Pachuca', rating: 7.0, goals: 0, apps: 0 },
    { number: 4, name: 'Edson Álvarez Jr.', position: 'DEF', club: 'Ajax', rating: 7.2, goals: 0, apps: 0 },
    { number: 13, name: 'Guillermo Ochoa', position: 'GK', club: 'AVS', rating: 7.5, goals: 0, apps: 0 },
  ],
  ITA: [
    { number: 10, name: 'Federico Chiesa', position: 'FWD', club: 'Liverpool', rating: 7.9, goals: 18, apps: 51, xg: 0.5 },
    { number: 9, name: 'Mateo Retegui', position: 'FWD', club: 'Atalanta', rating: 7.7, goals: 9, apps: 16, xg: 0.55 },
    { number: 16, name: 'Gianluca Scamacca', position: 'FWD', club: 'Atalanta', rating: 7.4, goals: 0, apps: 0 },
    { number: 8, name: 'Nicolò Barella', position: 'MID', club: 'Inter Milan', rating: 7.8, goals: 0, apps: 0 },
    { number: 6, name: 'Federico Dimarco', position: 'MID', club: 'Inter Milan', rating: 7.5, goals: 0, apps: 0 },
    { number: 19, name: 'Leonardo Bonucci', position: 'DEF', club: 'Fenerbahçe', rating: 7.0, goals: 0, apps: 0 },
    { number: 21, name: 'Gianluigi Donnarumma', position: 'GK', club: 'Man City', rating: 8.2, goals: 0, apps: 0 },
  ],
  CAN: [
    { number: 7, name: 'Jonathan David', position: 'FWD', club: 'Juventus', rating: 8.0, goals: 28, apps: 60, xg: 0.6 },
    { number: 17, name: 'Cyle Larin', position: 'FWD', club: 'Mallorca', rating: 7.2, goals: 29, apps: 75, xg: 0.45 },
    { number: 10, name: 'Alphonso Davies', position: 'MID', club: 'Bayern Munich', rating: 7.9, goals: 0, apps: 0 },
    { number: 6, name: 'Stephen Eustáquio', position: 'MID', club: 'Porto', rating: 7.3, goals: 0, apps: 0 },
    { number: 8, name: 'Ismaël Koné', position: 'MID', club: 'Marseille', rating: 7.1, goals: 0, apps: 0 },
    { number: 4, name: 'Moise Bombito', position: 'DEF', club: 'Nice', rating: 7.0, goals: 0, apps: 0 },
    { number: 1, name: 'Maxime Crépeau', position: 'GK', club: 'Portland Timbers', rating: 7.1, goals: 0, apps: 0 },
  ],
  PAN: [
    { number: 9, name: 'José Fajardo', position: 'FWD', club: 'AEL Limassol', rating: 6.8, goals: 0, apps: 0 },
    { number: 19, name: 'Ismael Díaz', position: 'FWD', club: 'Necaxa', rating: 6.7, goals: 0, apps: 0 },
    { number: 11, name: 'Édgar Bárcenas', position: 'MID', club: 'LAFC', rating: 6.9, goals: 0, apps: 0 },
    { number: 6, name: 'Adalberto Carrasquilla', position: 'MID', club: 'Alajuelense', rating: 6.8, goals: 0, apps: 0 },
    { number: 23, name: 'Eric Davis', position: 'DEF', club: 'Cartaginés', rating: 6.7, goals: 0, apps: 0 },
    { number: 3, name: 'Harold Cummings', position: 'DEF', club: 'San Carlos', rating: 6.6, goals: 0, apps: 0 },
    { number: 1, name: 'Orlando Mosquera', position: 'GK', club: 'Plaza Amador', rating: 6.8, goals: 0, apps: 0 },
  ],
  NED: [
    { number: 9, name: 'Memphis Depay', position: 'FWD', club: 'Corinthians', rating: 7.7, goals: 50, apps: 96, xg: 0.55 },
    { number: 17, name: 'Cody Gakpo', position: 'FWD', club: 'Liverpool', rating: 7.8, goals: 0, apps: 0 },
    { number: 22, name: 'Xavi Simons', position: 'MID', club: 'RB Leipzig', rating: 7.9, goals: 0, apps: 0 },
    { number: 8, name: 'Frenkie de Jong', position: 'MID', club: 'Barcelona', rating: 8.0, goals: 0, apps: 0 },
    { number: 6, name: 'Tijjani Reijnders', position: 'MID', club: 'AC Milan', rating: 7.6, goals: 0, apps: 0 },
    { number: 4, name: 'Virgil van Dijk', position: 'DEF', club: 'Liverpool', rating: 8.2, goals: 0, apps: 0 },
    { number: 1, name: 'Bart Verbruggen', position: 'GK', club: 'Brighton', rating: 7.3, goals: 0, apps: 0 },
  ],
  CHI: [
    { number: 9, name: 'Alexis Sánchez', position: 'FWD', club: 'Udinese', rating: 7.4, goals: 51, apps: 161, xg: 0.45 },
    { number: 7, name: 'Eduardo Vargas', position: 'FWD', club: 'O\'Higgins', rating: 6.9, goals: 0, apps: 0 },
    { number: 20, name: 'Charles Aránguiz', position: 'MID', club: 'Internacional', rating: 7.0, goals: 0, apps: 0 },
    { number: 8, name: 'Arturo Vidal', position: 'MID', club: 'Colo-Colo', rating: 7.2, goals: 0, apps: 0 },
    { number: 17, name: 'Gabriel Suazo', position: 'DEF', club: 'Toulouse', rating: 6.9, goals: 0, apps: 0 },
    { number: 4, name: 'Guillermo Maripán', position: 'DEF', club: 'Monaco', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Claudio Bravo', position: 'GK', club: 'Real Betis', rating: 7.1, goals: 0, apps: 0 },
  ],
  PER: [
    { number: 9, name: 'Gianluca Lapadula', position: 'FWD', club: 'Cagliari', rating: 7.0, goals: 0, apps: 0 },
    { number: 19, name: 'Yoshimar Yotún', position: 'MID', club: 'Sporting Cristal', rating: 6.8, goals: 0, apps: 0 },
    { number: 20, name: 'Edison Flores', position: 'MID', club: 'Universitario', rating: 6.8, goals: 0, apps: 0 },
    { number: 10, name: 'Christian Cueva', position: 'MID', club: 'Emelec', rating: 6.9, goals: 0, apps: 0 },
    { number: 17, name: 'Luis Advíncula', position: 'DEF', club: 'Boca Juniors', rating: 6.9, goals: 0, apps: 0 },
    { number: 2, name: 'Carlos Zambrano', position: 'DEF', club: 'Alianza Lima', rating: 6.8, goals: 0, apps: 0 },
    { number: 1, name: 'Pedro Gallese', position: 'GK', club: 'Orlando City', rating: 7.0, goals: 0, apps: 0 },
  ],
  FRA: [
    { number: 7, name: 'Kylian Mbappé', position: 'FWD', club: 'Real Madrid', rating: 9.0, goals: 48, apps: 86, xg: 0.78 },
    { number: 10, name: 'Ousmane Dembélé', position: 'FWD', club: 'PSG', rating: 8.1, goals: 0, apps: 0 },
    { number: 9, name: 'Marcus Thuram', position: 'FWD', club: 'Inter Milan', rating: 7.8, goals: 0, apps: 0 },
    { number: 8, name: 'Aurélien Tchouaméni', position: 'MID', club: 'Real Madrid', rating: 7.7, goals: 0, apps: 0 },
    { number: 6, name: 'Eduardo Camavinga', position: 'MID', club: 'Real Madrid', rating: 7.7, goals: 0, apps: 0 },
    { number: 5, name: 'William Saliba', position: 'DEF', club: 'Arsenal', rating: 7.9, goals: 0, apps: 0 },
    { number: 1, name: 'Mike Maignan', position: 'GK', club: 'AC Milan', rating: 7.8, goals: 0, apps: 0 },
  ],
  GER: [
    { number: 9, name: 'Kai Havertz', position: 'FWD', club: 'Arsenal', rating: 7.6, goals: 0, apps: 0 },
    { number: 11, name: 'Florian Wirtz', position: 'FWD', club: 'Bayer Leverkusen', rating: 8.0, goals: 0, apps: 0 },
    { number: 7, name: 'Serge Gnabry', position: 'FWD', club: 'Bayern Munich', rating: 7.4, goals: 0, apps: 0 },
    { number: 8, name: 'Toni Kroos', position: 'MID', club: 'Real Madrid', rating: 7.7, goals: 0, apps: 0 },
    { number: 6, name: 'Joshua Kimmich', position: 'MID', club: 'Bayern Munich', rating: 7.9, goals: 0, apps: 0 },
    { number: 4, name: 'Antonio Rüdiger', position: 'DEF', club: 'Real Madrid', rating: 7.6, goals: 0, apps: 0 },
    { number: 1, name: 'Manuel Neuer', position: 'GK', club: 'Bayern Munich', rating: 8.0, goals: 0, apps: 0 },
  ],
  MAR: [
    { number: 19, name: 'Youssef En-Nesyri', position: 'FWD', club: 'Fenerbahçe', rating: 7.5, goals: 0, apps: 0 },
    { number: 10, name: 'Hakim Ziyech', position: 'FWD', club: 'Galatasaray', rating: 7.3, goals: 0, apps: 0 },
    { number: 8, name: 'Azzedine Ounahi', position: 'MID', club: 'Panathinaikos', rating: 7.1, goals: 0, apps: 0 },
    { number: 17, name: 'Sofyan Amrabat', position: 'MID', club: 'Fenerbahçe', rating: 7.3, goals: 0, apps: 0 },
    { number: 6, name: 'Romain Saïss', position: 'DEF', club: 'Besiktas', rating: 7.0, goals: 0, apps: 0 },
    { number: 2, name: 'Achraf Hakimi', position: 'DEF', club: 'PSG', rating: 7.9, goals: 0, apps: 0 },
    { number: 1, name: 'Yassine Bounou', position: 'GK', club: 'Al-Hilal', rating: 7.6, goals: 0, apps: 0 },
  ],
  BRA: [
    { number: 10, name: 'Vinícius Júnior', position: 'FWD', club: 'Real Madrid', rating: 8.8, goals: 0, apps: 0 },
    { number: 9, name: 'Endrick', position: 'FWD', club: 'Real Madrid', rating: 7.6, goals: 0, apps: 0 },
    { number: 11, name: 'Raphinha', position: 'FWD', club: 'Barcelona', rating: 7.9, goals: 0, apps: 0 },
    { number: 8, name: 'Bruno Guimarães', position: 'MID', club: 'Newcastle', rating: 7.8, goals: 0, apps: 0 },
    { number: 5, name: 'Casemiro', position: 'MID', club: 'Man United', rating: 7.6, goals: 0, apps: 0 },
    { number: 4, name: 'Marquinhos', position: 'DEF', club: 'PSG', rating: 7.7, goals: 0, apps: 0 },
    { number: 1, name: 'Alisson Becker', position: 'GK', club: 'Liverpool', rating: 8.1, goals: 0, apps: 0 },
  ],
  JPN: [
    { number: 9, name: 'Ayase Ueda', position: 'FWD', club: 'Feyenoord', rating: 7.2, goals: 0, apps: 0 },
    { number: 11, name: 'Takefusa Kubo', position: 'FWD', club: 'Real Sociedad', rating: 7.5, goals: 0, apps: 0 },
    { number: 10, name: 'Kaoru Mitoma', position: 'MID', club: 'Brighton', rating: 7.5, goals: 0, apps: 0 },
    { number: 7, name: 'Junya Ito', position: 'MID', club: 'Reims', rating: 7.2, goals: 0, apps: 0 },
    { number: 6, name: 'Wataru Endo', position: 'MID', club: 'Liverpool', rating: 7.4, goals: 0, apps: 0 },
    { number: 5, name: 'Ko Itakura', position: 'DEF', club: "Borussia M'gladbach", rating: 7.1, goals: 0, apps: 0 },
    { number: 1, name: 'Zion Suzuki', position: 'GK', club: 'Urawa Reds', rating: 7.0, goals: 0, apps: 0 },
  ],
  CRO: [
    { number: 10, name: 'Luka Modrić', position: 'MID', club: 'Real Madrid', rating: 8.0, goals: 0, apps: 0 },
    { number: 8, name: 'Mateo Kovačić', position: 'MID', club: 'Man City', rating: 7.4, goals: 0, apps: 0 },
    { number: 7, name: 'Lovro Majer', position: 'MID', club: 'Wolfsburg', rating: 7.2, goals: 0, apps: 0 },
    { number: 9, name: 'Andrej Kramarić', position: 'FWD', club: 'Hoffenheim', rating: 7.4, goals: 0, apps: 0 },
    { number: 17, name: 'Ante Budimir', position: 'FWD', club: 'Osasuna', rating: 7.1, goals: 0, apps: 0 },
    { number: 6, name: 'Josko Gvardiol', position: 'DEF', club: 'Man City', rating: 7.7, goals: 0, apps: 0 },
    { number: 1, name: 'Dominik Livaković', position: 'GK', club: 'Fenerbahçe', rating: 7.6, goals: 0, apps: 0 },
  ],
  TUN: [
    { number: 19, name: 'Seifeddine Jaziri', position: 'FWD', club: 'Al-Markhiya', rating: 6.8, goals: 0, apps: 0 },
    { number: 7, name: 'Youssef Msakni', position: 'FWD', club: 'Al-Arabi', rating: 6.9, goals: 0, apps: 0 },
    { number: 8, name: 'Ellyes Skhiri', position: 'MID', club: 'PSV', rating: 7.2, goals: 0, apps: 0 },
    { number: 10, name: 'Naïm Sliti', position: 'MID', club: 'Al-Wakrah', rating: 6.9, goals: 0, apps: 0 },
    { number: 4, name: 'Yassine Meriah', position: 'DEF', club: 'CR Belouizdad', rating: 6.7, goals: 0, apps: 0 },
    { number: 2, name: 'Mohamed Dräger', position: 'DEF', club: 'Lugano', rating: 6.8, goals: 0, apps: 0 },
    { number: 1, name: 'Aymen Dahmen', position: 'GK', club: 'CS Sfaxien', rating: 6.9, goals: 0, apps: 0 },
  ],
  ENG: [
    { number: 9, name: 'Harry Kane', position: 'FWD', club: 'Bayern Munich', rating: 8.6, goals: 70, apps: 99, xg: 0.7 },
    { number: 10, name: 'Jude Bellingham', position: 'MID', club: 'Real Madrid', rating: 8.3, goals: 0, apps: 0 },
    { number: 7, name: 'Bukayo Saka', position: 'MID', club: 'Arsenal', rating: 8.0, goals: 0, apps: 0 },
    { number: 11, name: 'Phil Foden', position: 'MID', club: 'Man City', rating: 8.1, goals: 0, apps: 0 },
    { number: 17, name: 'Cole Palmer', position: 'FWD', club: 'Chelsea', rating: 7.9, goals: 0, apps: 0 },
    { number: 6, name: 'Marc Guéhi', position: 'DEF', club: 'Crystal Palace', rating: 7.3, goals: 0, apps: 0 },
    { number: 1, name: 'Jordan Pickford', position: 'GK', club: 'Everton', rating: 7.5, goals: 0, apps: 0 },
  ],
  SEN: [
    { number: 10, name: 'Sadio Mané', position: 'FWD', club: 'Al-Nassr', rating: 7.8, goals: 0, apps: 0 },
    { number: 9, name: 'Boulaye Dia', position: 'FWD', club: 'Al-Ahli', rating: 7.2, goals: 0, apps: 0 },
    { number: 11, name: 'Ismaïla Sarr', position: 'MID', club: 'Crystal Palace', rating: 7.3, goals: 0, apps: 0 },
    { number: 8, name: 'Pape Matar Sarr', position: 'MID', club: 'Tottenham', rating: 7.3, goals: 0, apps: 0 },
    { number: 5, name: 'Kalidou Koulibaly', position: 'DEF', club: 'Al-Hilal', rating: 7.5, goals: 0, apps: 0 },
    { number: 4, name: 'Abdou Diallo', position: 'DEF', club: 'Al-Arabi', rating: 7.0, goals: 0, apps: 0 },
    { number: 1, name: 'Édouard Mendy', position: 'GK', club: 'Al-Ahli', rating: 7.4, goals: 0, apps: 0 },
  ],
  IRN: [
    { number: 20, name: 'Sardar Azmoun', position: 'FWD', club: 'Roma', rating: 7.2, goals: 0, apps: 0 },
    { number: 9, name: 'Mehdi Taremi', position: 'FWD', club: 'Inter Milan', rating: 7.6, goals: 0, apps: 0 },
    { number: 10, name: 'Ali Gholizadeh', position: 'MID', club: 'Charleroi', rating: 6.9, goals: 0, apps: 0 },
    { number: 8, name: 'Saeid Ezatolahi', position: 'MID', club: 'Vejle', rating: 6.8, goals: 0, apps: 0 },
    { number: 3, name: 'Ehsan Hajsafi', position: 'DEF', club: 'Al-Ittihad', rating: 6.9, goals: 0, apps: 0 },
    { number: 4, name: 'Majid Hosseini', position: 'DEF', club: 'Kayserispor', rating: 6.8, goals: 0, apps: 0 },
    { number: 1, name: 'Alireza Beiranvand', position: 'GK', club: 'Persepolis', rating: 7.0, goals: 0, apps: 0 },
  ],
  QAT: [
    { number: 19, name: 'Almoez Ali', position: 'FWD', club: 'Al-Duhail', rating: 7.0, goals: 0, apps: 0 },
    { number: 11, name: 'Akram Afif', position: 'FWD', club: 'Al-Sadd', rating: 7.4, goals: 0, apps: 0 },
    { number: 10, name: 'Hassan Al-Haydos', position: 'MID', club: 'Al-Sadd', rating: 6.9, goals: 0, apps: 0 },
    { number: 8, name: 'Karim Boudiaf', position: 'MID', club: 'Al-Rayyan', rating: 6.7, goals: 0, apps: 0 },
    { number: 5, name: 'Bassam Al-Rawi', position: 'DEF', club: 'Al-Sadd', rating: 6.6, goals: 0, apps: 0 },
    { number: 2, name: 'Pedro Miguel', position: 'DEF', club: 'Al-Sadd', rating: 6.6, goals: 0, apps: 0 },
    { number: 1, name: 'Saad Al-Sheeb', position: 'GK', club: 'Al-Sadd', rating: 6.8, goals: 0, apps: 0 },
  ],
  ESP: [
    { number: 9, name: 'Álvaro Morata', position: 'FWD', club: 'Milan', rating: 7.6, goals: 0, apps: 0 },
    { number: 19, name: 'Lamine Yamal', position: 'FWD', club: 'Barcelona', rating: 8.5, goals: 0, apps: 0 },
    { number: 11, name: 'Nico Williams', position: 'MID', club: 'Athletic Bilbao', rating: 7.8, goals: 0, apps: 0 },
    { number: 8, name: 'Fabián Ruiz', position: 'MID', club: 'PSG', rating: 7.6, goals: 0, apps: 0 },
    { number: 6, name: 'Rodri', position: 'MID', club: 'Man City', rating: 8.4, goals: 0, apps: 0 },
    { number: 4, name: 'Aymeric Laporte', position: 'DEF', club: 'Al-Nassr', rating: 7.3, goals: 0, apps: 0 },
    { number: 1, name: 'Unai Simón', position: 'GK', club: 'Athletic Bilbao', rating: 7.5, goals: 0, apps: 0 },
  ],
  AUS: [
    { number: 9, name: 'Mitchell Duke', position: 'FWD', club: 'Fagiano Okayama', rating: 6.8, goals: 0, apps: 0 },
    { number: 11, name: 'Craig Goodwin', position: 'FWD', club: 'Adelaide United', rating: 6.7, goals: 0, apps: 0 },
    { number: 10, name: 'Riley McGree', position: 'MID', club: 'Charlotte FC', rating: 6.9, goals: 0, apps: 0 },
    { number: 17, name: 'Aaron Mooy', position: 'MID', club: 'Celtic', rating: 7.0, goals: 0, apps: 0 },
    { number: 5, name: 'Fran Karačić', position: 'DEF', club: 'Brescia', rating: 6.6, goals: 0, apps: 0 },
    { number: 4, name: 'Kye Rowles', position: 'DEF', club: 'Hearts', rating: 6.8, goals: 0, apps: 0 },
    { number: 1, name: 'Mathew Ryan', position: 'GK', club: 'AEK Athens', rating: 6.9, goals: 0, apps: 0 },
  ],
  GHA: [
    { number: 9, name: 'Inaki Williams', position: 'FWD', club: 'Athletic Bilbao', rating: 7.2, goals: 0, apps: 0 },
    { number: 10, name: 'Jordan Ayew', position: 'FWD', club: 'Leicester City', rating: 6.9, goals: 0, apps: 0 },
    { number: 8, name: 'Thomas Partey', position: 'MID', club: 'Villarreal', rating: 7.3, goals: 0, apps: 0 },
    { number: 7, name: 'Mohammed Kudus', position: 'MID', club: 'West Ham', rating: 7.4, goals: 0, apps: 0 },
    { number: 5, name: 'Alexander Djiku', position: 'DEF', club: 'Strasbourg', rating: 6.8, goals: 0, apps: 0 },
    { number: 21, name: 'Gideon Mensah', position: 'DEF', club: 'Olympiacos', rating: 6.7, goals: 0, apps: 0 },
    { number: 1, name: 'Richard Ofori', position: 'GK', club: 'Orlando Pirates', rating: 6.8, goals: 0, apps: 0 },
  ],
  KOR: [
    { number: 7, name: 'Son Heung-min', position: 'FWD', club: 'LAFC', rating: 8.0, goals: 0, apps: 0 },
    { number: 11, name: 'Hwang Hee-chan', position: 'FWD', club: 'Wolverhampton', rating: 7.3, goals: 0, apps: 0 },
    { number: 10, name: 'Lee Kang-in', position: 'MID', club: 'PSG', rating: 7.5, goals: 0, apps: 0 },
    { number: 8, name: 'Hwang In-beom', position: 'MID', club: 'Zenit', rating: 7.1, goals: 0, apps: 0 },
    { number: 4, name: 'Kim Min-jae', position: 'DEF', club: 'Bayern Munich', rating: 7.6, goals: 0, apps: 0 },
    { number: 2, name: 'Kim Moon-hwan', position: 'DEF', club: 'Jeonbuk Hyundai', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Jo Hyeon-woo', position: 'GK', club: 'Ulsan HD', rating: 7.0, goals: 0, apps: 0 },
  ],
  POR: [
    { number: 7, name: 'Cristiano Ronaldo', position: 'FWD', club: 'Al-Nassr', rating: 8.4, goals: 135, apps: 217, xg: 0.7 },
    { number: 9, name: 'Gonçalo Ramos', position: 'FWD', club: 'PSG', rating: 7.6, goals: 0, apps: 0 },
    { number: 8, name: 'Bruno Fernandes', position: 'MID', club: 'Man United', rating: 7.9, goals: 0, apps: 0 },
    { number: 17, name: 'Rafael Leão', position: 'MID', club: 'AC Milan', rating: 7.7, goals: 0, apps: 0 },
    { number: 6, name: 'Rúben Neves', position: 'MID', club: 'Al-Hilal', rating: 7.4, goals: 0, apps: 0 },
    { number: 4, name: 'Rúben Dias', position: 'DEF', club: 'Man City', rating: 8.0, goals: 0, apps: 0 },
    { number: 1, name: 'Diogo Costa', position: 'GK', club: 'Porto', rating: 7.7, goals: 0, apps: 0 },
  ],
  BEL: [
    { number: 9, name: 'Romelu Lukaku', position: 'FWD', club: 'Napoli', rating: 7.7, goals: 0, apps: 0 },
    { number: 7, name: 'Kevin De Bruyne', position: 'MID', club: 'Napoli', rating: 8.2, goals: 0, apps: 0 },
    { number: 10, name: 'Jérémy Doku', position: 'MID', club: 'Man City', rating: 7.6, goals: 0, apps: 0 },
    { number: 11, name: 'Leandro Trossard', position: 'FWD', club: 'Arsenal', rating: 7.4, goals: 0, apps: 0 },
    { number: 8, name: 'Youri Tielemans', position: 'MID', club: 'Aston Villa', rating: 7.3, goals: 0, apps: 0 },
    { number: 4, name: 'Wout Faes', position: 'DEF', club: 'Leicester City', rating: 7.0, goals: 0, apps: 0 },
    { number: 1, name: 'Koen Casteels', position: 'GK', club: 'Wolfsburg', rating: 7.2, goals: 0, apps: 0 },
  ],
  KSA: [
    { number: 10, name: 'Salem Al-Dawsari', position: 'FWD', club: 'Al-Hilal', rating: 7.2, goals: 0, apps: 0 },
    { number: 11, name: 'Firas Al-Buraikan', position: 'FWD', club: 'Al-Ahli', rating: 6.9, goals: 0, apps: 0 },
    { number: 8, name: 'Abdullah Al-Khaibari', position: 'MID', club: 'Al-Shabab', rating: 6.7, goals: 0, apps: 0 },
    { number: 17, name: 'Salman Al-Faraj', position: 'MID', club: 'Al-Hilal', rating: 6.8, goals: 0, apps: 0 },
    { number: 5, name: 'Ali Al-Bulayhi', position: 'DEF', club: 'Al-Hilal', rating: 6.8, goals: 0, apps: 0 },
    { number: 12, name: 'Yasser Al-Shahrani', position: 'DEF', club: 'Al-Hilal', rating: 6.7, goals: 0, apps: 0 },
    { number: 1, name: 'Mohammed Al-Owais', position: 'GK', club: 'Al-Hilal', rating: 6.9, goals: 0, apps: 0 },
  ],
  ECU: [
    { number: 13, name: 'Enner Valencia', position: 'FWD', club: 'Internacional', rating: 7.3, goals: 0, apps: 0 },
    { number: 9, name: 'Kevin Rodríguez', position: 'FWD', club: 'St. Gallen', rating: 6.9, goals: 0, apps: 0 },
    { number: 8, name: 'Moisés Caicedo', position: 'MID', club: 'Chelsea', rating: 7.8, goals: 0, apps: 0 },
    { number: 17, name: 'Alan Franco', position: 'MID', club: 'Toluca', rating: 6.9, goals: 0, apps: 0 },
    { number: 3, name: 'Piero Hincapié', position: 'DEF', club: 'Bayer Leverkusen', rating: 7.4, goals: 0, apps: 0 },
    { number: 4, name: 'Félix Torres', position: 'DEF', club: 'Cruz Azul', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Hernán Galíndez', position: 'GK', club: 'Aucas', rating: 6.9, goals: 0, apps: 0 },
  ],
  URU: [
    { number: 9, name: 'Darwin Núñez', position: 'FWD', club: 'Al-Hilal', rating: 7.6, goals: 0, apps: 0 },
    { number: 7, name: 'Facundo Pellistri', position: 'MID', club: 'Leeds United', rating: 7.0, goals: 0, apps: 0 },
    { number: 10, name: 'Giorgian de Arrascaeta', position: 'MID', club: 'Flamengo', rating: 7.5, goals: 0, apps: 0 },
    { number: 8, name: 'Federico Valverde', position: 'MID', club: 'Real Madrid', rating: 8.0, goals: 0, apps: 0 },
    { number: 4, name: 'Ronald Araújo', position: 'DEF', club: 'Barcelona', rating: 7.7, goals: 0, apps: 0 },
    { number: 3, name: 'José María Giménez', position: 'DEF', club: 'Atl. Madrid', rating: 7.4, goals: 0, apps: 0 },
    { number: 1, name: 'Sergio Rochet', position: 'GK', club: 'Internacional', rating: 7.2, goals: 0, apps: 0 },
  ],
  COL: [
    { number: 10, name: 'James Rodríguez', position: 'MID', club: 'León', rating: 7.6, goals: 0, apps: 0 },
    { number: 9, name: 'Luis Díaz', position: 'FWD', club: 'Liverpool', rating: 7.9, goals: 0, apps: 0 },
    { number: 11, name: 'Jhon Córdoba', position: 'FWD', club: 'Krasnodar', rating: 7.1, goals: 0, apps: 0 },
    { number: 8, name: 'Jefferson Lerma', position: 'MID', club: 'Crystal Palace', rating: 7.1, goals: 0, apps: 0 },
    { number: 4, name: 'Jhon Lucumí', position: 'DEF', club: 'Bologna', rating: 7.0, goals: 0, apps: 0 },
    { number: 3, name: 'Davinson Sánchez', position: 'DEF', club: 'Galatasaray', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Camilo Vargas', position: 'GK', club: 'Atlas', rating: 7.0, goals: 0, apps: 0 },
  ],
  SUI: [
    { number: 10, name: 'Granit Xhaka', position: 'MID', club: 'Bayer Leverkusen', rating: 7.5, goals: 0, apps: 0 },
    { number: 7, name: 'Breel Embolo', position: 'FWD', club: 'Monaco', rating: 7.2, goals: 0, apps: 0 },
    { number: 11, name: 'Ruben Vargas', position: 'MID', club: 'Galatasaray', rating: 7.0, goals: 0, apps: 0 },
    { number: 19, name: 'Dan Ndoye', position: 'FWD', club: 'Bologna', rating: 7.1, goals: 0, apps: 0 },
    { number: 4, name: 'Nico Elvedi', position: 'DEF', club: "Borussia M'gladbach", rating: 6.9, goals: 0, apps: 0 },
    { number: 3, name: 'Manuel Akanji', position: 'DEF', club: 'Man City', rating: 7.5, goals: 0, apps: 0 },
    { number: 1, name: 'Yann Sommer', position: 'GK', club: 'Inter Milan', rating: 7.6, goals: 0, apps: 0 },
  ],
  CMR: [
    { number: 9, name: 'Vincent Aboubakar', position: 'FWD', club: 'Al-Qadsiah', rating: 7.0, goals: 0, apps: 0 },
    { number: 17, name: 'Bryan Mbeumo', position: 'FWD', club: 'Man United', rating: 7.5, goals: 0, apps: 0 },
    { number: 8, name: 'André-Frank Zambo Anguissa', position: 'MID', club: 'Napoli', rating: 7.3, goals: 0, apps: 0 },
    { number: 19, name: 'Georges-Kévin Nkoudou', position: 'MID', club: 'Besiktas', rating: 6.8, goals: 0, apps: 0 },
    { number: 4, name: "Jean-Charles Castelletto", position: 'DEF', club: 'Nantes', rating: 6.8, goals: 0, apps: 0 },
    { number: 5, name: 'Nicolas Nkoulou', position: 'DEF', club: 'Al-Wehda', rating: 6.7, goals: 0, apps: 0 },
    { number: 1, name: 'André Onana', position: 'GK', club: 'Man United', rating: 7.2, goals: 0, apps: 0 },
  ],
  CRC: [
    { number: 9, name: 'Joel Campbell', position: 'FWD', club: 'Alajuelense', rating: 6.8, goals: 0, apps: 0 },
    { number: 11, name: 'Anthony Contreras', position: 'FWD', club: 'Alajuelense', rating: 6.7, goals: 0, apps: 0 },
    { number: 8, name: 'Yeltsin Tejeda', position: 'MID', club: 'Saprissa', rating: 6.7, goals: 0, apps: 0 },
    { number: 10, name: 'Celso Borges', position: 'MID', club: 'Saprissa', rating: 6.6, goals: 0, apps: 0 },
    { number: 3, name: 'Francisco Calvo', position: 'DEF', club: 'Comunicaciones', rating: 6.7, goals: 0, apps: 0 },
    { number: 4, name: 'Keysher Fuller', position: 'DEF', club: 'Herediano', rating: 6.6, goals: 0, apps: 0 },
    { number: 1, name: 'Keylor Navas', position: 'GK', club: 'Newell\'s Old Boys', rating: 7.3, goals: 0, apps: 0 },
  ],
  JAM: [
    { number: 9, name: 'Shamar Nicholson', position: 'FWD', club: 'Cercle Brugge', rating: 6.8, goals: 0, apps: 0 },
    { number: 11, name: 'Leon Bailey', position: 'FWD', club: 'Aston Villa', rating: 7.4, goals: 0, apps: 0 },
    { number: 7, name: 'Bobby Reid', position: 'MID', club: 'Bournemouth', rating: 6.9, goals: 0, apps: 0 },
    { number: 8, name: 'Demarai Gray', position: 'MID', club: 'Al-Ettifaq', rating: 7.0, goals: 0, apps: 0 },
    { number: 5, name: 'Michail Antonio', position: 'DEF', club: 'West Ham', rating: 6.8, goals: 0, apps: 0 },
    { number: 3, name: 'Adrian Mariappa', position: 'DEF', club: 'Watford', rating: 6.5, goals: 0, apps: 0 },
    { number: 1, name: 'Andre Blake', position: 'GK', club: 'Philadelphia Union', rating: 7.1, goals: 0, apps: 0 },
  ],
  SRB: [
    { number: 9, name: 'Aleksandar Mitrović', position: 'FWD', club: 'Al-Hilal', rating: 7.5, goals: 0, apps: 0 },
    { number: 10, name: 'Dušan Tadić', position: 'MID', club: 'Fenerbahçe', rating: 7.3, goals: 0, apps: 0 },
    { number: 17, name: 'Dušan Vlahović', position: 'FWD', club: 'Juventus', rating: 7.4, goals: 0, apps: 0 },
    { number: 8, name: 'Sergej Milinković-Savić', position: 'MID', club: 'Al-Hilal', rating: 7.6, goals: 0, apps: 0 },
    { number: 4, name: 'Nikola Milenković', position: 'DEF', club: 'Fiorentina', rating: 7.1, goals: 0, apps: 0 },
    { number: 24, name: 'Strahinja Pavlović', position: 'DEF', club: 'AC Milan', rating: 7.0, goals: 0, apps: 0 },
    { number: 1, name: 'Predrag Rajković', position: 'GK', club: 'Mallorca', rating: 7.0, goals: 0, apps: 0 },
  ],
  POL: [
    { number: 9, name: 'Robert Lewandowski', position: 'FWD', club: 'Barcelona', rating: 8.4, goals: 84, apps: 151, xg: 0.7 },
    { number: 10, name: 'Piotr Zieliński', position: 'MID', club: 'Inter Milan', rating: 7.3, goals: 0, apps: 0 },
    { number: 20, name: 'Przemysław Frankowski', position: 'MID', club: 'Como', rating: 6.9, goals: 0, apps: 0 },
    { number: 17, name: 'Karol Świderski', position: 'FWD', club: 'Charlotte FC', rating: 6.9, goals: 0, apps: 0 },
    { number: 4, name: 'Jakub Kiwior', position: 'DEF', club: 'Arsenal', rating: 7.1, goals: 0, apps: 0 },
    { number: 15, name: 'Jan Bednarek', position: 'DEF', club: 'Southampton', rating: 6.8, goals: 0, apps: 0 },
    { number: 1, name: 'Wojciech Szczęsny', position: 'GK', club: 'Barcelona', rating: 7.2, goals: 0, apps: 0 },
  ],
  WAL: [
    { number: 11, name: 'Brennan Johnson', position: 'FWD', club: 'Tottenham', rating: 7.1, goals: 0, apps: 0 },
    { number: 10, name: 'Daniel James', position: 'FWD', club: 'Leeds United', rating: 7.0, goals: 0, apps: 0 },
    { number: 14, name: 'Harry Wilson', position: 'MID', club: 'Fulham', rating: 6.9, goals: 0, apps: 0 },
    { number: 7, name: 'David Brooks', position: 'MID', club: 'Bournemouth', rating: 6.9, goals: 0, apps: 0 },
    { number: 5, name: 'Ben Davies', position: 'DEF', club: 'Tottenham', rating: 6.9, goals: 0, apps: 0 },
    { number: 6, name: 'Joe Rodon', position: 'DEF', club: 'Leeds United', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Wayne Hennessey', position: 'GK', club: 'Nottingham Forest', rating: 6.8, goals: 0, apps: 0 },
  ],
  DEN: [
    { number: 10, name: 'Christian Eriksen', position: 'MID', club: 'Man United', rating: 7.5, goals: 0, apps: 0 },
    { number: 9, name: 'Rasmus Højlund', position: 'FWD', club: 'Man United', rating: 7.3, goals: 0, apps: 0 },
    { number: 11, name: 'Mikkel Damsgaard', position: 'MID', club: 'Brentford', rating: 7.1, goals: 0, apps: 0 },
    { number: 23, name: 'Pierre-Emile Højbjerg', position: 'MID', club: 'Marseille', rating: 7.3, goals: 0, apps: 0 },
    { number: 4, name: 'Andreas Christensen', position: 'DEF', club: 'Barcelona', rating: 7.2, goals: 0, apps: 0 },
    { number: 6, name: 'Joachim Andersen', position: 'DEF', club: 'Fulham', rating: 7.0, goals: 0, apps: 0 },
    { number: 1, name: 'Kasper Schmeichel', position: 'GK', club: 'Celtic', rating: 7.1, goals: 0, apps: 0 },
  ],
  RSA: [
    { number: 9, name: 'Percy Tau', position: 'FWD', club: 'Al-Ahly', rating: 6.9, goals: 0, apps: 0 },
    { number: 11, name: 'Lyle Foster', position: 'FWD', club: 'Burnley', rating: 7.0, goals: 0, apps: 0 },
    { number: 8, name: 'Teboho Mokoena', position: 'MID', club: 'Mamelodi Sundowns', rating: 6.9, goals: 0, apps: 0 },
    { number: 10, name: 'Themba Zwane', position: 'MID', club: 'Mamelodi Sundowns', rating: 6.8, goals: 0, apps: 0 },
    { number: 5, name: 'Mothobi Mvala', position: 'DEF', club: 'Mamelodi Sundowns', rating: 6.6, goals: 0, apps: 0 },
    { number: 3, name: 'Sifiso Hlanti', position: 'DEF', club: 'Orlando Pirates', rating: 6.6, goals: 0, apps: 0 },
    { number: 1, name: 'Ronwen Williams', position: 'GK', club: 'Mamelodi Sundowns', rating: 7.0, goals: 0, apps: 0 },
  ],
  NGA: [
    { number: 7, name: 'Ademola Lookman', position: 'FWD', club: 'Atalanta', rating: 7.7, goals: 0, apps: 0 },
    { number: 9, name: 'Victor Osimhen', position: 'FWD', club: 'Galatasaray', rating: 8.0, goals: 0, apps: 0 },
    { number: 10, name: 'Alex Iwobi', position: 'MID', club: 'Fulham', rating: 7.2, goals: 0, apps: 0 },
    { number: 17, name: 'Frank Onyeka', position: 'MID', club: 'Brentford', rating: 6.9, goals: 0, apps: 0 },
    { number: 4, name: 'William Troost-Ekong', position: 'DEF', club: 'Besiktas', rating: 7.0, goals: 0, apps: 0 },
    { number: 5, name: 'Calvin Bassey', position: 'DEF', club: 'Fulham', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Stanley Nwabali', position: 'GK', club: 'Chippa United', rating: 6.9, goals: 0, apps: 0 },
  ],
  AUT: [
    { number: 9, name: 'Marko Arnautović', position: 'FWD', club: 'Red Star Belgrade', rating: 7.1, goals: 0, apps: 0 },
    { number: 10, name: 'Christoph Baumgartner', position: 'MID', club: 'RB Leipzig', rating: 7.3, goals: 0, apps: 0 },
    { number: 8, name: 'Konrad Laimer', position: 'MID', club: 'Bayern Munich', rating: 7.2, goals: 0, apps: 0 },
    { number: 7, name: 'Marcel Sabitzer', position: 'MID', club: 'Borussia Dortmund', rating: 7.2, goals: 0, apps: 0 },
    { number: 4, name: 'Kevin Danso', position: 'DEF', club: 'Tottenham', rating: 7.0, goals: 0, apps: 0 },
    { number: 5, name: 'Philipp Lienhart', position: 'DEF', club: 'Freiburg', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Patrick Pentz', position: 'GK', club: 'Brøndby', rating: 6.9, goals: 0, apps: 0 },
  ],
  SCO: [
    { number: 9, name: 'Lyndon Dykes', position: 'FWD', club: 'Birmingham City', rating: 6.9, goals: 0, apps: 0 },
    { number: 11, name: 'Che Adams', position: 'FWD', club: 'Torino', rating: 6.9, goals: 0, apps: 0 },
    { number: 7, name: 'John McGinn', position: 'MID', club: 'Aston Villa', rating: 7.2, goals: 0, apps: 0 },
    { number: 10, name: 'Scott McTominay', position: 'MID', club: 'Napoli', rating: 7.5, goals: 0, apps: 0 },
    { number: 5, name: 'Jack Hendry', position: 'DEF', club: 'Al-Ettifaq', rating: 6.8, goals: 0, apps: 0 },
    { number: 4, name: 'Grant Hanley', position: 'DEF', club: 'Norwich City', rating: 6.7, goals: 0, apps: 0 },
    { number: 1, name: 'Angus Gunn', position: 'GK', club: 'Norwich City', rating: 6.8, goals: 0, apps: 0 },
  ],
  EGY: [
    { number: 7, name: 'Mohamed Salah', position: 'FWD', club: 'Liverpool', rating: 8.6, goals: 58, apps: 100, xg: 0.65 },
    { number: 9, name: 'Mostafa Mohamed', position: 'FWD', club: 'Galatasaray', rating: 7.0, goals: 0, apps: 0 },
    { number: 10, name: 'Omar Marmoush', position: 'MID', club: 'Man City', rating: 7.4, goals: 0, apps: 0 },
    { number: 17, name: 'Mohamed Elneny', position: 'MID', club: 'Arsenal', rating: 6.9, goals: 0, apps: 0 },
    { number: 4, name: 'Mohamed Abdelmonem', position: 'DEF', club: 'Zamalek', rating: 6.7, goals: 0, apps: 0 },
    { number: 2, name: 'Ahmed Hegazy', position: 'DEF', club: 'Al-Ittihad', rating: 6.8, goals: 0, apps: 0 },
    { number: 1, name: 'Mohamed El Shenawy', position: 'GK', club: 'Al-Ahly', rating: 7.1, goals: 0, apps: 0 },
  ],
  CIV: [
    { number: 11, name: 'Franck Kessié', position: 'MID', club: 'Al-Ahli', rating: 7.3, goals: 0, apps: 0 },
    { number: 9, name: 'Sébastien Haller', position: 'FWD', club: 'Leganés', rating: 7.1, goals: 0, apps: 0 },
    { number: 10, name: 'Nicolas Pépé', position: 'FWD', club: 'Villarreal', rating: 7.0, goals: 0, apps: 0 },
    { number: 8, name: 'Ibrahim Sangaré', position: 'MID', club: 'Nottingham Forest', rating: 7.0, goals: 0, apps: 0 },
    { number: 4, name: 'Odilon Kossounou', position: 'DEF', club: 'Atalanta', rating: 6.9, goals: 0, apps: 0 },
    { number: 5, name: 'Ousmane Diomande', position: 'DEF', club: 'Sporting CP', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Yahia Fofana', position: 'GK', club: 'Angers', rating: 6.8, goals: 0, apps: 0 },
  ],
  TUR: [
    { number: 17, name: 'Kenan Yıldız', position: 'FWD', club: 'Juventus', rating: 7.6, goals: 0, apps: 0 },
    { number: 9, name: 'Cenk Tosun', position: 'FWD', club: 'Beşiktaş', rating: 6.9, goals: 0, apps: 0 },
    { number: 10, name: 'Arda Güler', position: 'MID', club: 'Real Madrid', rating: 7.5, goals: 0, apps: 0 },
    { number: 8, name: 'Hakan Çalhanoğlu', position: 'MID', club: 'Inter Milan', rating: 7.6, goals: 0, apps: 0 },
    { number: 4, name: 'Merih Demiral', position: 'DEF', club: 'Al-Ahli', rating: 7.1, goals: 0, apps: 0 },
    { number: 3, name: 'Çağlar Söyüncü', position: 'DEF', club: 'Atlético Madrid', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Uğurcan Çakır', position: 'GK', club: 'Trabzonspor', rating: 7.3, goals: 0, apps: 0 },
  ],
  UKR: [
    { number: 10, name: 'Mykhaylo Mudryk', position: 'FWD', club: 'Chelsea', rating: 7.3, goals: 0, apps: 0 },
    { number: 9, name: 'Artem Dovbyk', position: 'FWD', club: 'Roma', rating: 7.4, goals: 0, apps: 0 },
    { number: 7, name: 'Oleksandr Zinchenko', position: 'MID', club: 'Nottingham Forest', rating: 7.2, goals: 0, apps: 0 },
    { number: 8, name: 'Heorhiy Sudakov', position: 'MID', club: 'Shakhtar Donetsk', rating: 7.1, goals: 0, apps: 0 },
    { number: 4, name: 'Illia Zabarnyi', position: 'DEF', club: 'Bournemouth', rating: 7.1, goals: 0, apps: 0 },
    { number: 5, name: 'Vitalii Mykolenko', position: 'DEF', club: 'Everton', rating: 6.9, goals: 0, apps: 0 },
    { number: 1, name: 'Anatolii Trubin', position: 'GK', club: 'Benfica', rating: 7.0, goals: 0, apps: 0 },
  ],
  PAR: [
    { number: 9, name: 'Antonio Sanabria', position: 'FWD', club: 'Torino', rating: 6.9, goals: 0, apps: 0 },
    { number: 7, name: 'Miguel Almirón', position: 'MID', club: 'Atlanta United', rating: 7.0, goals: 0, apps: 0 },
    { number: 10, name: 'Ángel Romero', position: 'FWD', club: 'Corinthians', rating: 6.8, goals: 0, apps: 0 },
    { number: 8, name: 'Mathías Villasanti', position: 'MID', club: 'Grêmio', rating: 6.8, goals: 0, apps: 0 },
    { number: 4, name: 'Omar Alderete', position: 'DEF', club: 'Getafe', rating: 6.9, goals: 0, apps: 0 },
    { number: 3, name: 'Gustavo Gómez', position: 'DEF', club: 'Palmeiras', rating: 7.0, goals: 0, apps: 0 },
    { number: 1, name: 'Roberto Fernández', position: 'GK', club: 'Estudiantes', rating: 6.8, goals: 0, apps: 0 },
  ],
  VEN: [
    { number: 9, name: 'Salomón Rondón', position: 'FWD', club: 'Pumas UNAM', rating: 7.0, goals: 0, apps: 0 },
    { number: 7, name: 'Jhon Murillo', position: 'FWD', club: 'Junior', rating: 6.7, goals: 0, apps: 0 },
    { number: 10, name: 'Yeferson Soteldo', position: 'MID', club: 'Santos', rating: 6.9, goals: 0, apps: 0 },
    { number: 8, name: 'Tomás Rincón', position: 'MID', club: 'Estudiantes de Mérida', rating: 6.7, goals: 0, apps: 0 },
    { number: 4, name: 'Nahuel Ferraresi', position: 'DEF', club: 'São Paulo', rating: 6.8, goals: 0, apps: 0 },
    { number: 3, name: 'Wilker Ángel', position: 'DEF', club: 'Pachuca', rating: 6.7, goals: 0, apps: 0 },
    { number: 1, name: 'Rafael Romo', position: 'GK', club: 'Vasco da Gama', rating: 6.8, goals: 0, apps: 0 },
  ],
};

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly api = inject(ApiService);
  readonly liveMatch = signal<Match>({
    id: 'por-esp',
    group: 'Round of 16',
    stadium: 'AT&T Stadium, Arlington TX',
    crowd: 80000,
    kickoff: '3:00 PM ET',
    status: 'upcoming',
    minute: 0,
    home: teams['POR'],
    away: teams['ESP'],
    homeScore: 0,
    awayScore: 0,
    stats: { possession: [50, 50], shotsOnTarget: [0, 0], xg: [0, 0], shots: [0, 0] },
    winProb: [35, 28, 37],
    timeline: [],
  });

  readonly upcomingToday: Match[] = [
    {
      id: 'usa-bel', group: 'Round of 16', stadium: 'Lumen Field, Seattle WA', kickoff: '8:00 PM ET', status: 'upcoming',
      home: teams['USA'], away: teams['BEL'], homeScore: 0, awayScore: 0,
      stats: { possession: [50, 50], shotsOnTarget: [0, 0], xg: [0, 0], shots: [0, 0] }, winProb: [42, 26, 32], timeline: [],
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
    { name: 'Group A', status: 'Live Update', rows: [
      { pos: 1, team: teams['USA'], played: 3, gd: 5, pts: 9 },
      { pos: 2, team: teams['CAN'], played: 3, gd: 2, pts: 6 },
      { pos: 3, team: teams['MEX'], played: 3, gd: -1, pts: 3 },
      { pos: 4, team: teams['PAN'], played: 3, gd: -6, pts: 0 },
    ]},
    { name: 'Group B', status: 'Live Match: 65\'', rows: [
      { pos: 1, team: teams['ARG'], played: 2, gd: 3, pts: 6 },
      { pos: 2, team: teams['NED'], played: 2, gd: 1, pts: 4 },
      { pos: 3, team: teams['CHI'], played: 2, gd: 0, pts: 1 },
      { pos: 4, team: teams['PER'], played: 2, gd: -4, pts: 0 },
    ]},
    { name: 'Group C', status: 'Final Standings', rows: [
      { pos: 1, team: teams['FRA'], played: 3, gd: 4, pts: 6 },
      { pos: 2, team: teams['ITA'], played: 3, gd: 1, pts: 3 },
      { pos: 3, team: teams['GER'], played: 3, gd: -3, pts: 3 },
      { pos: 4, team: teams['MAR'], played: 3, gd: -2, pts: 0 },
    ]},
    { name: 'Group D', status: 'Final Standings', rows: [
      { pos: 1, team: teams['BRA'], played: 3, gd: 7, pts: 9 },
      { pos: 2, team: teams['JPN'], played: 3, gd: 0, pts: 4 },
      { pos: 3, team: teams['CRO'], played: 3, gd: -2, pts: 2 },
      { pos: 4, team: teams['TUN'], played: 3, gd: -5, pts: 0 },
    ]},
    { name: 'Group E', status: 'Awaiting Kickoff', rows: [
      { pos: 1, team: teams['ENG'], played: 0, gd: 0, pts: 0 },
      { pos: 2, team: teams['SEN'], played: 0, gd: 0, pts: 0 },
      { pos: 3, team: teams['IRN'], played: 0, gd: 0, pts: 0 },
      { pos: 4, team: teams['QAT'], played: 0, gd: 0, pts: 0 },
    ]},
    { name: 'Group F', status: 'Awaiting Kickoff', rows: [
      { pos: 1, team: teams['ESP'], played: 0, gd: 0, pts: 0 },
      { pos: 2, team: teams['KOR'], played: 0, gd: 0, pts: 0 },
      { pos: 3, team: teams['GHA'], played: 0, gd: 0, pts: 0 },
      { pos: 4, team: teams['AUS'], played: 0, gd: 0, pts: 0 },
    ]},
    { name: 'Group G', status: 'Awaiting Kickoff', rows: [
      { pos: 1, team: teams['POR'], played: 0, gd: 0, pts: 0 },
      { pos: 2, team: teams['BEL'], played: 0, gd: 0, pts: 0 },
      { pos: 3, team: teams['ECU'], played: 0, gd: 0, pts: 0 },
      { pos: 4, team: teams['KSA'], played: 0, gd: 0, pts: 0 },
    ]},
    { name: 'Group H', status: 'Awaiting Kickoff', rows: [
      { pos: 1, team: teams['URU'], played: 0, gd: 0, pts: 0 },
      { pos: 2, team: teams['COL'], played: 0, gd: 0, pts: 0 },
      { pos: 3, team: teams['SUI'], played: 0, gd: 0, pts: 0 },
      { pos: 4, team: teams['CMR'], played: 0, gd: 0, pts: 0 },
    ]},
    { name: 'Group I', status: 'Awaiting Kickoff', rows: [
      { pos: 1, team: teams['SRB'], played: 0, gd: 0, pts: 0 },
      { pos: 2, team: teams['POL'], played: 0, gd: 0, pts: 0 },
      { pos: 3, team: teams['CRC'], played: 0, gd: 0, pts: 0 },
      { pos: 4, team: teams['JAM'], played: 0, gd: 0, pts: 0 },
    ]},
    { name: 'Group J', status: 'Awaiting Kickoff', rows: [
      { pos: 1, team: teams['DEN'], played: 0, gd: 0, pts: 0 },
      { pos: 2, team: teams['WAL'], played: 0, gd: 0, pts: 0 },
      { pos: 3, team: teams['NGA'], played: 0, gd: 0, pts: 0 },
      { pos: 4, team: teams['RSA'], played: 0, gd: 0, pts: 0 },
    ]},
    { name: 'Group K', status: 'Awaiting Kickoff', rows: [
      { pos: 1, team: teams['AUT'], played: 0, gd: 0, pts: 0 },
      { pos: 2, team: teams['EGY'], played: 0, gd: 0, pts: 0 },
      { pos: 3, team: teams['SCO'], played: 0, gd: 0, pts: 0 },
      { pos: 4, team: teams['CIV'], played: 0, gd: 0, pts: 0 },
    ]},
    { name: 'Group L', status: 'Awaiting Kickoff', rows: [
      { pos: 1, team: teams['TUR'], played: 0, gd: 0, pts: 0 },
      { pos: 2, team: teams['UKR'], played: 0, gd: 0, pts: 0 },
      { pos: 3, team: teams['PAR'], played: 0, gd: 0, pts: 0 },
      { pos: 4, team: teams['VEN'], played: 0, gd: 0, pts: 0 },
    ]},
  ];

  readonly bracket: BracketRound[] = (() => {
    const r32Pairs: [string, string][] = [
      ['USA', 'PAN'], ['CAN', 'MEX'], ['ARG', 'PER'], ['NED', 'CHI'],
      ['FRA', 'MAR'], ['ITA', 'GER'], ['BRA', 'TUN'], ['JPN', 'CRO'],
      ['ENG', 'QAT'], ['SEN', 'IRN'], ['ESP', 'AUS'], ['KOR', 'GHA'],
      ['POR', 'KSA'], ['BEL', 'ECU'], ['URU', 'CMR'], ['COL', 'SUI'],
    ];

    const tobt = (code: string): BracketTeam | null => {
      const t = teams[code];
      if (!t) return null;
      return { code: t.code, name: t.name, flag: t.flag };
    };

    const makeMatch = (homeCode: string, awayCode: string, winnerCode: string): BracketMatch => ({
      home: tobt(homeCode),
      away: tobt(awayCode),
      homeScore: winnerCode === homeCode ? 2 : 1,
      awayScore: winnerCode === awayCode ? 2 : 1,
      winnerCode,
      status: 'finished',
    });

    const r32 = r32Pairs.map(([h, a]) => makeMatch(h, a, h));
    const r32Winners = r32.map((m) => m.winnerCode!);

    const r16Pairs: [string, string][] = [
      [r32Winners[0], r32Winners[1]], [r32Winners[2], r32Winners[3]],
      [r32Winners[4], r32Winners[5]], [r32Winners[6], r32Winners[7]],
      [r32Winners[8], r32Winners[9]], [r32Winners[10], r32Winners[11]],
      [r32Winners[12], r32Winners[13]], [r32Winners[14], r32Winners[15]],
    ];
    const r16 = r16Pairs.map(([h, a]) => makeMatch(h, a, h));
    const r16Winners = r16.map((m) => m.winnerCode!);

    const qfPairs: [string, string][] = [
      [r16Winners[0], r16Winners[1]], [r16Winners[2], r16Winners[3]],
      [r16Winners[4], r16Winners[5]], [r16Winners[6], r16Winners[7]],
    ];
    const qf = qfPairs.map(([h, a]) => makeMatch(h, a, h));
    const qfWinners = qf.map((m) => m.winnerCode!);

    const sfPairs: [string, string][] = [
      [qfWinners[0], qfWinners[1]], [qfWinners[2], qfWinners[3]],
    ];
    const sf = sfPairs.map(([h, a]) => makeMatch(h, a, h));
    const sfWinners = sf.map((m) => m.winnerCode!);

    const final = [makeMatch(sfWinners[0], sfWinners[1], sfWinners[0])];

    return [
      { name: 'Round of 32', matches: r32 },
      { name: 'Round of 16', matches: r16 },
      { name: 'Quarterfinals', matches: qf },
      { name: 'Semifinals', matches: sf },
      { name: 'Final', matches: final },
    ];
  })();

  readonly stories: StoryItem[] = [
    { tag: 'BREAKING', title: 'Mbappé fitness concerns grow ahead of Brazil clash', time: '12m ago' },
    { tag: 'TOURNAMENT', title: "Los Angeles prepares for the 'Match of the Century'", time: '1h ago' },
  ];

  getMatchById(id: string): Match | undefined {
    const all: Match[] = [
      this.liveMatch(),
      ...this.upcomingToday,
      ...this.completedMatches,
    ];
    return all.find((m) => m.id === id);
  }

  getTeam(code: string): Team | undefined {
    return teams[code];
  }

  getSquad(code: string): Player[] {
    return players[code] ?? [];
  }

  allTeams(): Team[] {
    return Object.values(teams);
  }

  private mapEspnToGroups(espn: EspnStandingsResponse): Group[] {
    return espn.children.map((child) => {
      const rows: StandingRow[] = child.standings.entries.map((entry, idx) => {
        const abbr = entry.team.abbreviation.toUpperCase();
        const mockTeam = teams[abbr];
        const teamObj: Team = mockTeam ?? {
          code: abbr,
          name: entry.team.displayName,
          flag: '',
          rank: 0,
          group: child.abbreviation.replace('Group ', ''),
          form: [],
        };
        const getStat = (name: string) =>
          entry.stats.find((s) => s.name === name)?.value ?? 0;
        return {
          pos: idx + 1,
          team: teamObj,
          played: getStat('gamesPlayed'),
          gd: getStat('pointDifferential'),
          pts: getStat('points'),
        };
      });
      return { name: child.name, status: 'Live Update', rows };
    });
  }

  readonly liveStandings$: Observable<Group[]> = this.api.getStandings().pipe(
    map((resp) => (resp ? this.mapEspnToGroups(resp) : this.groups)),
    catchError(() => of(this.groups)),
    startWith(this.groups),
  );

  readonly liveBracket$: Observable<BracketRound[]> = this.api.getKnockoutBracket().pipe(
    map(rounds => rounds.length ? rounds : this.bracket),
    startWith(this.bracket),
    catchError(() => of(this.bracket)),
  );

  getFixtures(): ScheduleFixture[] {
    const groupOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const baseDate = new Date(2026, 5, 12);
    const roundPairings: [number, number][][] = [
      [[0, 1], [2, 3]],
      [[0, 2], [1, 3]],
      [[0, 3], [1, 2]],
    ];

    const today = new Date(2026, 6, 5);
    today.setHours(0, 0, 0, 0);

    const fixtures: ScheduleFixture[] = [];
    let id = 0;

    for (let gi = 0; gi < groupOrder.length; gi++) {
      const groupLetter = groupOrder[gi];
      const group = this.groups.find((g) => g.name === `Group ${groupLetter}`)!;
      const groupTeams = group.rows.map((r) => r.team);

      for (let round = 0; round < 3; round++) {
        const groupSlot = Math.floor(gi / 2);
        const dayOffset = groupSlot + round * 7;
        const matchDate = new Date(baseDate);
        matchDate.setDate(baseDate.getDate() + dayOffset);
        matchDate.setHours(0, 0, 0, 0);

        const d = new Date(matchDate);
        d.setHours(0, 0, 0, 0);
        const isPast = d < today;
        const isToday = d.getTime() === today.getTime();
        const status: ScheduleFixture['status'] = isPast ? 'finished' : (isToday ? 'live' : 'upcoming');

        for (const [ti, tj] of roundPairings[round]) {
          const home = groupTeams[ti];
          const away = groupTeams[tj];
          const fixture: ScheduleFixture = {
            id: `${++id}-${home.code}-${away.code}`,
            home,
            away,
            group: groupLetter,
            date: new Date(matchDate),
            status,
          };
          if (status === 'finished') {
            fixture.homeScore = Math.floor(Math.random() * 3);
            fixture.awayScore = Math.floor(Math.random() * 3);
          }
          fixtures.push(fixture);
        }
      }
    }

    return fixtures.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private generateTickerEvent(m: Match): TimelineEvent | null {
    const rand = Math.random();
    const minute = `${m.minute ?? 0}'`;
    const team: 'home' | 'away' = Math.random() > 0.5 ? 'home' : 'away';
    const teamName = team === 'home' ? m.home.name : m.away.name;

    if (rand < 0.10) {
      return { minute, type: 'goal', team, title: `Goal! ${teamName}`, detail: 'Tap-in from close range' };
    } else if (rand < 0.30) {
      return { minute, type: 'card', team, title: `Yellow Card · ${teamName}`, detail: 'Foul in midfield' };
    } else if (rand < 0.60) {
      return { minute, type: 'sub', team, title: `Substitution (${team === 'home' ? m.home.code : m.away.code})`, detail: 'Tactical change' };
    } else if (rand < 0.70) {
      return { minute, type: 'whistle', team, title: 'VAR Check', detail: `Reviewing potential penalty for ${teamName}` };
    }
    return null;
  }

  startLiveTicker() {
    return interval(5000).subscribe(() => {
      const m = this.liveMatch();
      if (m.status !== 'live') return;
      const drift = Math.random() > 0.5 ? 1 : -1;
      const [hp] = m.stats.possession;
      const nextHp = Math.min(70, Math.max(30, hp + drift));
      const newMinute = Math.min(90, (m.minute ?? 0) + 1);

      const event = this.generateTickerEvent({ ...m, minute: newMinute });
      const newTimeline = event ? [event, ...m.timeline] : m.timeline;

      let homeScore = m.homeScore;
      let awayScore = m.awayScore;
      if (event?.type === 'goal') {
        if (event.team === 'home') homeScore++;
        else awayScore++;
      }

      this.liveMatch.set({
        ...m,
        minute: newMinute,
        homeScore,
        awayScore,
        stats: { ...m.stats, possession: [nextHp, 100 - nextHp] },
        timeline: newTimeline,
      });

      if (event?.type === 'goal') {
        this._goalFired.set(true);
      }
    });
  }

  readonly _goalFired = signal(false);
}
