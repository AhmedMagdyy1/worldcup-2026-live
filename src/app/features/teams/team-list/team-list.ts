import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/data.service';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './team-list.html',
  styleUrl: './team-list.scss',
})
export class TeamList {
  private readonly data = inject(DataService);
  readonly teams = this.data.allTeams().sort((a, b) => a.rank - b.rank);
}
