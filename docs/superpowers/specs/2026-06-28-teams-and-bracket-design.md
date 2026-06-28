# Design: Full Team Roster + Knockout Bracket

Date: 2026-06-28

## Context

The app currently mocks ~17 teams and only one full squad (Argentina). Two
enhancements were requested: a complete 48-team roster, and a visual map of
the knockout rounds from Round of 32 to the Final.

## 1. Full 48-team roster

- `DataService` (`src/app/core/data.service.ts`) expands its `teams` map to
  all 48 qualified teams for the 2026 format, organized into 12 groups (A–L)
  of 4 teams each, matching the real expanded tournament structure.
- Each team keeps the existing `Team` shape (`code`, `name`, `flag`, `rank`,
  `group`, `form`) — no model changes needed.
- Each team gets a trimmed squad of 7-8 key players (captain, top scorer(s),
  1-2 more attackers/midfielders, a defender, a goalkeeper) using the existing
  `Player` shape. This matches the depth already shown on the Argentina page.
- No component changes required: `TeamList` already iterates
  `data.allTeams()`, and `TeamDetail` already calls `data.getSquad(code)`.
  This is purely a data-file expansion.
- `groups` (used by the Standings page) is regenerated to reflect all 12
  groups instead of the current 4, computed from the same team list (played/
  GD/points can stay as plausible mock numbers, consistent with the current
  approach of hand-authored mock standings).

## 2. Knockout bracket

### Data

- New static mock structure in `DataService`, e.g. `bracket: BracketRound[]`,
  hand-authored (not derived from group standings) representing a full
  32-team single-elimination knockout: Round of 32 → Round of 16 →
  Quarterfinals → Semifinals → Final.
- New model in `core/models.ts`:
  ```ts
  export interface BracketMatch {
    home: Team | null;       // null = "TBD" slot not yet decided
    away: Team | null;
    homeScore?: number;
    awayScore?: number;
    winnerCode?: string;      // team code that advances, if decided
  }

  export interface BracketRound {
    name: string;             // 'Round of 32' | 'Round of 16' | 'Quarterfinals' | 'Semifinals' | 'Final'
    matches: BracketMatch[];
  }
  ```
- The mock bracket is internally consistent: each round's matches resolve
  into the next round's slots (winner of R32 match 1 + match 2 feeds R16
  match 1, etc.), ending in one Final match with a highlighted winner.

### Routing

- New lazy-loaded route `/bracket`:
  ```ts
  {
    path: 'bracket',
    loadComponent: () => import('./features/bracket/bracket').then(m => m.Bracket),
  }
  ```
- Added to:
  - `Shell.topNav` (after "Teams", before "Schedule")
  - `Shell.sideNav` (new entry, icon 🏆)
  - `Shell.bottomNav` — mobile nav stays at 4 visible tabs; "Bracket" is
    reachable via the sidebar-equivalent or replaces "Predict" placement
    decision deferred to implementation, default: add as 5th tab, shrink
    tab font-size if needed to fit 5 across.

### UI — Desktop

- Horizontal tree layout, one column per round, rendered with an inline SVG
  for connector lines (consistent with the approved mockup) and HTML/CSS
  nodes positioned via absolute layout or flex spacers, matching column
  scaling already used elsewhere (e.g. `live` stats panels).
- Each team node shows flag + 3-letter code in a rounded chip; the winning
  side of a decided match is highlighted green (`var(--green)` /
  `var(--green-dim)`, consistent with existing palette); the Final match
  winner chip is gold (`var(--yellow)`), with a 🏆 label next to it.
- Horizontally scrollable container so the 5-round tree fits on narrower
  desktop widths without breaking layout (`overflow-x: auto`, same pattern
  as the Tactical Lineups panel).

### UI — Mobile (≤860px, consistent with existing breakpoint)

- Stage-stepper: a round-selector tab row (same `.tabs` pattern as the Live
  page's Timeline/Lineups/Stats tabs) listing the 5 round names.
- Selected round's matches render as stacked cards, each showing
  `flag code score — flag code score`, consistent with the "stage cards"
  mockup approved during brainstorming.
- No SVG/connector lines on mobile — pure card list, avoiding the
  scroll-and-zoom problem a tree layout has on small screens.

### Component

- `src/app/features/bracket/bracket.ts` + `.html` + `.scss`, standalone,
  following the same structure as `Live`/`Standings`: inject `DataService`,
  expose `rounds = this.data.bracket`, a `selectedRound` signal for the
  mobile tab state.

## Out of scope

- No live simulation/auto-advancement of the bracket from group results.
- No editing/predicting your own bracket (that's a natural follow-up for the
  existing `/predictions` page, not part of this design).
- Mobile bottom-nav final tab arrangement (5 vs 4 tabs) is an implementation
  detail to resolve during build, not a blocking design decision.
