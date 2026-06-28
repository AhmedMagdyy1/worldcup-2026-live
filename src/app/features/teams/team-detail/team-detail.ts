import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../../core/data.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './team-detail.html',
  styleUrl: './team-detail.scss',
})
export class TeamDetail {
  private readonly data = inject(DataService);
  private readonly route = inject(ActivatedRoute);

  private readonly code = this.route.snapshot.paramMap.get('code') ?? 'ARG';
  readonly team = this.data.getTeam(this.code) ?? this.data.allTeams()[0];
  readonly squad = this.data.getSquad(this.code);
  readonly positions: ('ALL' | 'GK' | 'DEF' | 'MID' | 'FWD')[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];
  readonly posFilter = signal<'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD'>('ALL');

  get filteredSquad() {
    const f = this.posFilter();
    return f === 'ALL' ? this.squad : this.squad.filter((p) => p.position === f);
  }
}
