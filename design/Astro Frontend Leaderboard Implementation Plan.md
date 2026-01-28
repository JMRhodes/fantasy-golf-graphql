# Problem statement
Design and implement an Astro-based frontend leaderboard page that consumes the existing NestJS GraphQL API to display a ranked list of fantasy golf teams, styled similarly to the provided standings mock, with clear data flow, routing, and UI composition.
# Current state overview
* Backend:
    * NestJS GraphQL API is configured via `GraphQLModule.forRoot` with `ApolloDriver` and `autoSchemaFile: true`, exposing a standard `/graphql` endpoint (`src/app.module.ts`).
    * Domain modules include `TeamsModule`, `TournamentsModule`, `ResultsModule`, `PlayersModule`, and `OwnersModule`.
    * Teams:
        * `Team` GraphQL type exposes `id`, optional `name`, and an `ownerId` field referencing an `Owner` (`src/teams/schemas/team.schema.ts`).
        * Queries:
        * `getAllTeams(): [Team]` and `getTeamById(id: ID!): Team` in `TeamsResolver` (`src/teams/teams.resolver.ts`).
    * Tournaments and results:
        * `Tournament` exposes `id`, `name`, `description`, `status`, `start_date`, `end_date`, and `results?: [Result]` where `results` is a list of populated `Result` documents (`src/tournaments/schemas/tournament.schema.ts`).
        * `TournamentResolver` exposes `getAllTournaments(): [Tournament]`, `getTournament(id: ID!): Tournament`, and mutations for creating tournaments and adding results (`src/tournaments/tournaments.resolver.ts`).
        * `Result` entities are populated with their related `player` in `TournamentService.getAllTournaments`, `getTournamentById`, and `ResultService.getAllResults` (`src/tournaments/tournaments.service.ts`, `src/results/results.service.ts`).
* Frontend:
    * No Astro frontend files were found in the repository scan (no `*.astro` files under `/Volumes/Galaxy/www/pga-api`), so the Astro project and leaderboard page do not yet exist.
* External guidance:
    * Astro docs recommend server-side data fetching directly in `.astro` components using the global `fetch()` API, including POSTing GraphQL queries to remote endpoints and mapping the JSON response into strongly typed objects.
    * Apollo Client can be used in a framework-agnostic way in the browser, but the docs emphasize its primary integration with React; simple `fetch`-based GraphQL calls are sufficient for non-interactive, server-rendered lists.
# Proposed changes
## 1. Define GraphQL query shape for the leaderboard
* Decide the primary data source for the leaderboard:
    * Option A: Tournament-centric leaderboard for a specific tournament, using `getTournament(id)` and deriving per-team standings from `results` and associated `player` data (if teams are indirectly represented via players and owners).
    * Option B: Team-centric leaderboard based on aggregated results per team, exposed via a new dedicated GraphQL query such as `getTeamLeaderboard(tournamentId?: ID): [TeamLeaderboardRow]` that returns rank, team, owner, total points, and wins.
* For clarity and efficient frontend use, prefer adding a dedicated leaderboard query (Option B) that returns exactly the fields needed to render one row of the UI (rank, team name, owner display name, total points, wins, optional logo/avatar URLs) rather than computing rankings entirely in the client.
* Update the NestJS API (in a later backend-focused task) to expose this leaderboard query and corresponding GraphQL type, ensuring it is backed by properly indexed MongoDB queries and/or aggregation pipelines.
## 2. Establish Astro project structure and routing for the leaderboard
* Create or reuse an Astro project (if not already created) with a standard structure:
    * `src/pages/leaderboard.astro` for the main leaderboard page route (e.g., `/leaderboard`).
    * `src/components/leaderboard/LeaderboardTable.astro` for the table/list container.
    * `src/components/leaderboard/LeaderboardRow.astro` for individual row rendering.
    * Optional layout wrapper `src/layouts/BaseLayout.astro` for shared header, spacing, and global styles.
* Configure environment variables for the API endpoint (e.g., `PUBLIC_GRAPHQL_ENDPOINT`) in `.env` and reference them via `import.meta.env` to avoid hardcoding URLs.
## 3. Implement GraphQL data fetching in Astro
* In `src/pages/leaderboard.astro`:
    * Use the frontmatter script to perform a server-side `fetch` POST request to the NestJS GraphQL endpoint using the leaderboard query.
    * Structure the request body as `{ query: "...", variables: { tournamentId } }` when needed.
    * Parse the JSON response, handle and surface any GraphQL or network errors, and map the data into a typed `LeaderboardRow` interface.
* Keep the data fetching logic encapsulated:
    * Optionally create a small utility module (e.g., `src/lib/graphql.ts`) to wrap the `fetch` call and centralize headers, error handling, and type casting.
* For the initial implementation, avoid introducing Apollo Client on the frontend; rely on server-side `fetch` so the page renders fully with data on first load and caching is delegated to the browser / any upstream CDN.
## 4. Design the leaderboard UI to match the provided mock
* Layout:
    * Implement a mobile-first card-style table similar to the screenshot: a centered card on a neutral background with a header, subtle separators, and vertically stacked rows.
    * Include a page header section with title (e.g., "Standings" or "Leaderboard") and optional subtitle (e.g., selected tournament name and last-updated text).
* Row content:
    * Columns per row: rank number, team avatar/logo or initials badge, team name, owner name / secondary line, total points, and wins.
    * Apply alternating row background colors or subtle dividers, following the mock’s light grey stripes.
* Responsiveness:
    * On small screens, present rows as in the mock with compact spacing.
    * On larger screens, expand horizontal padding and potentially add more metadata (e.g., tournament, total events played) while keeping the core columns consistent.
* Visual details:
    * Use consistent typography scale and weight for hierarchy (title, column labels, primary values, secondary labels).
    * Incorporate rounded corners, soft drop shadow, and a muted background outside the card, echoing the design.
## 5. Handle loading, empty, and error states
* In the `leaderboard.astro` frontmatter:
    * Represent loading implicitly by leveraging server-side rendering: the initial HTML includes either the fully rendered leaderboard or an error message; no in-browser loading spinner is required for the initial page.
    * Gracefully handle error cases (network error, GraphQL errors) by rendering a friendly message with minimal diagnostic detail and optional link to retry (simple link to reload the page).
* UI states inside the leaderboard card:
    * Show an "No leaderboard data available" state if the query returns an empty array.
    * Consider a lightweight skeleton or placeholder rows if the leaderboard is later enhanced with client-side filtering or sorting that triggers additional fetches.
## 6. Prepare for future enhancements
* Filtering and context:
    * Anticipate future additions like a tournament selector or tabs (e.g., “Current Week”, “Season to Date”) in the header, modeled after the mock’s championship dropdown.
    * Keep the GraphQL query and Astro page structure flexible enough to accept optional filter parameters (query variables and URL search params).
* Client interactivity:
    * If richer client-side interactions are needed later (live updates, sorting without reload, client-side pagination), introduce a lightweight GraphQL helper or Apollo Client instance in a dedicated client-side script, mounted onto the existing server-rendered markup.
* Reuse:
    * Design `LeaderboardRow` and any badge/avatar subcomponents to be reusable in other contexts (e.g., owner detail pages, team details) by keeping data props minimal and presentation-focused.
