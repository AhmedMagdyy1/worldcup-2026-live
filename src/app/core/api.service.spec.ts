import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { EspnStandingsResponse, EspnScoreboardResponse } from './api.models';

const mockStandingsResponse: EspnStandingsResponse = {
  id: '8675309',
  name: 'FIFA World Cup',
  children: [
    {
      uid: 's:600~l:606~g:1',
      id: '1',
      name: 'Group A',
      abbreviation: 'Group A',
      standings: {
        entries: [
          {
            team: {
              id: '203',
              abbreviation: 'MEX',
              displayName: 'Mexico',
              shortDisplayName: 'Mexico',
            },
            stats: [
              { name: 'gamesPlayed', value: 3, displayValue: '3' },
              { name: 'points', value: 9, displayValue: '9' },
              { name: 'pointDifferential', value: 6, displayValue: '+6' },
            ],
          },
        ],
        season: 2026,
        seasonDisplayName: '2026 FIFA World Cup',
      },
    },
  ],
};

const mockScoreboardResponse: EspnScoreboardResponse = {
  events: [
    {
      id: '1',
      name: 'Mexico vs USA',
      date: '2026-06-11T20:00Z',
      competitions: [],
      status: {
        displayClock: '74:00',
        period: 2,
        type: { name: 'STATUS_IN_PROGRESS', shortDetail: "74'", completed: false },
      },
    },
  ],
};

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStandings()', () => {
    it('returns mapped standings response', async () => {
      const promise = firstValueFrom(service.getStandings());
      const req = httpMock.expectOne(
        'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockStandingsResponse);
      const resp = await promise;
      expect(resp).toBeTruthy();
      expect(resp!.children.length).toBe(1);
      expect(resp!.children[0].name).toBe('Group A');
      expect(resp!.children[0].standings.entries[0].team.abbreviation).toBe('MEX');
    });

    it('returns null on HTTP error', async () => {
      const promise = firstValueFrom(service.getStandings());
      const req = httpMock.expectOne(
        'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings'
      );
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      const resp = await promise;
      expect(resp).toBeNull();
    });
  });

  describe('getScoreboard()', () => {
    it('returns scoreboard response', async () => {
      const promise = firstValueFrom(service.getScoreboard());
      const req = httpMock.expectOne(
        'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockScoreboardResponse);
      const resp = await promise;
      expect(resp).toBeTruthy();
      expect(resp!.events.length).toBe(1);
      expect(resp!.events[0].name).toBe('Mexico vs USA');
    });

    it('returns null on HTTP error', async () => {
      const promise = firstValueFrom(service.getScoreboard());
      const req = httpMock.expectOne(
        'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
      );
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      const resp = await promise;
      expect(resp).toBeNull();
    });
  });
});
