import {
  Component,
  computed,
  inject,
  output,
  signal,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/data.service';
import { Team } from '../../core/models';

@Component({
  selector: 'app-search-palette',
  standalone: true,
  templateUrl: './search-palette.html',
  styleUrl: './search-palette.scss',
})
export class SearchPaletteComponent implements AfterViewInit {
  private router = inject(Router);
  private data = inject(DataService);

  close = output<void>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  query = signal('');
  activeIndex = signal(0);

  results = computed<Team[]>(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.data.allTeams();
    return this.data.allTeams().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q)
    );
  });

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    const res = this.results();
    switch (event.key) {
      case 'Escape':
        this.close.emit();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update((i) => Math.min(i + 1, res.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        if (res[this.activeIndex()]) {
          this.selectTeam(res[this.activeIndex()]);
        }
        break;
    }
  }

  onQueryChange(value: string) {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  selectTeam(team: Team) {
    this.router.navigate(['/teams', team.code]);
    this.close.emit();
  }
}
