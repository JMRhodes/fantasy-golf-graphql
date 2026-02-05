# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This is a fullstack fantasy golf application consisting of two main components:

- **Backend API** (root directory): A NestJS GraphQL API that handles data persistence and business logic for managing owners, players, teams, and tournaments. Built with NestJS, Apollo Server, Drizzle ORM, and PostgreSQL.
- **Frontend** (`/frontend`): An Astro static site that provides the user interface for the fantasy golf application. Built with Astro 5.x and configured for static site generation (`output: 'static'`).

The API exposes a GraphQL endpoint that the frontend can consume to display and manage fantasy golf data.

### Frontend architecture

The Astro frontend uses:

- **View Transitions API** – Smooth page transitions enabled via `<ViewTransitions />` in the `BaseLayout` component. The navigation persists across transitions using `transition:persist` for a seamless SPA-like experience.
- **BaseLayout component** (`src/layouts/BaseLayout.astro`) – Shared layout that wraps all pages with navigation, view transitions, and global styles.
- **Shared styles** (`src/styles/page.css`) – Common component styles (cards, tables, buttons, etc.) imported globally.
- **Static generation** – All pages are pre-rendered at build time, fetching data from the GraphQL API during the build process.

Frontend development commands (run from `/frontend`):

- Development server: `yarn dev` (starts at `localhost:4321`)
- Build for production: `yarn build`
- Preview production build: `yarn preview`

## Development commands

### Install dependencies

- Preferred: `yarn install`
- Alternative: `npm install`

### Build

- Full TypeScript build (outputs to `dist/`):
  - `yarn build`

### Run the API

- Development server with hot-reload:
  - `yarn start:dev`
- Standard development start (no watch):
  - `yarn start`
- Production build + run (after `yarn build`):
  - `yarn start:prod`

The NestJS entrypoint is `src/main.ts`, which bootstraps `AppModule` and reads configuration via `ConfigService` (see `env.validation.ts`).

### Linting and formatting

- Lint TypeScript sources with ESLint (auto-fix enabled):
  - `yarn lint`
- Format code with Prettier (configured in `.prettierrc`):
  - `yarn format`

### Tests

Jest is configured in `package.json` for unit tests and `test/jest-e2e.json` for e2e tests.

- All unit tests:
  - `yarn test`
- Watch mode for unit tests:
  - `yarn test:watch`
- Test coverage report:
  - `yarn test:cov`
- E2E test suite:
  - `yarn test:e2e`
- Run a single test file (Jest):
  - `yarn test -- path/to/your.spec.ts`

Unit tests are expected to live under `src/` with filenames matching `*.spec.ts` (see the Jest `testRegex` in `package.json`). E2E tests should live under `test/` and match `*.e2e-spec.ts`.

### Database migrations

Drizzle Kit is used for database migrations:

- Generate migrations from schema changes:
  - `yarn drizzle-kit generate`
- Apply migrations to the database:
  - `yarn drizzle-kit migrate`
- Open Drizzle Studio (database GUI):
  - `yarn drizzle-kit studio`

## Environment and configuration

Configuration is centralized via `@nestjs/config` and validated by `env.validation.ts`:

- Required environment variables:
  - `NODE_ENV` (one of: `local`, `development`, `production`)
  - `PORT` (0–65535)
  - `DATABASE_URL` (PostgreSQL connection string)
- `ConfigModule.forRoot` (in `src/app.module.ts`) loads process env vars, applies `validate`, and makes them globally available.
- `DrizzlePostgresModule.registerAsync` reads `DATABASE_URL` from `ConfigService` to connect to PostgreSQL.

If validation fails (missing or invalid env vars), the app will throw on startup.

## High-level architecture

### Framework and runtime

- This is a NestJS (`@nestjs/core`) GraphQL API using the Apollo driver (`@nestjs/apollo`, `@apollo/server`).
- Persistence is handled via Drizzle ORM (`drizzle-orm`, `drizzle-orm/postgres-js`) against a PostgreSQL instance.
- The GraphQL schema is generated at runtime (`autoSchemaFile: true` in `src/app.module.ts`), based on decorators on TypeScript classes.

### Application module graph

The root module is `AppModule` (`src/app.module.ts`), which wires together:

- `ConfigModule` (global env configuration + validation via `env.validation.ts`)
- `DrizzlePostgresModule` (PostgreSQL connection using `DATABASE_URL`, injected as `'DB_DEV'`)
- `GraphQLModule` (ApolloDriver with code-first schema generation and GraphiQL enabled)
- Domain feature modules:
  - `OwnersModule`
  - `PlayersModule`
  - `TeamsModule`
  - `TournamentsModule`

Each feature module follows a consistent Nest pattern:

- `*.module.ts` – registers providers and exports services.
- `*.service.ts` – encapsulates database access via injected `PostgresJsDatabase<typeof schema>` instance (tagged `'DB_DEV'`).
- `*.resolver.ts` – defines the GraphQL API (queries and mutations) using decorators over the corresponding schema classes and DTOs.

### Database schema structure

Drizzle table definitions live in `src/db/schema/`:

- `players.schema.ts` – players table
- `owners.schema.ts` – owners table
- `teams.schema.ts` – teams table with FK to owners
- `team-players.schema.ts` – junction table for teams ↔ players many-to-many relationship
- `tournaments.schema.ts` – tournaments table with status enum
- `relations.ts` – Drizzle relation definitions for nested queries
- `index.ts` – re-exports all schemas and relations

### GraphQL + Drizzle data model

The domain model is expressed in two places:

- **GraphQL types** – `@ObjectType()` and `@Field()`-annotated classes under each module's `schemas/` directory.
- **Drizzle schemas** – `pgTable()` definitions in `src/db/schema/` with column types and constraints.

Key aggregates and relationships:

- **Owners** (`src/owners`)
  - Drizzle: `ownersTable` with `id`, `name`, `email` (unique)
  - GraphQL: `Owner` type
  - Service: `getAllOwners`, `getOwnerById`, `getOwnerByEmail`, `createOwner`

- **Players** (`src/players`)
  - Drizzle: `playersTable` with `id`, `name`, `pgaId`, `salary`, `avatarUrl`
  - GraphQL: `Player` type with `totalPoints` resolved field
  - Service: `getAllPlayers`, `createPlayer`

- **Teams** (`src/teams`)
  - Drizzle: `teamsTable` with `id`, `name`, `ownerId` (FK to owners)
  - Junction: `teamPlayersTable` with composite PK `(teamId, playerId)` – ensures unique players per team
  - GraphQL: `Team` type with nested `owner` and `players` fields
  - Service: `getAllTeams`, `getTeamById`, `getTeamsByOwnerId`, `createTeam` (requires exactly 4 unique player IDs)
  - Uses Drizzle relations to populate owner and players in queries

- **Tournaments** (`src/tournaments`)
  - Drizzle: `tournamentsTable` with `id`, `name`, `description`, `status` (enum: UPCOMING, IN-PROGRESS, COMPLETED), `avatarUrl`, `startDate`, `endDate`
  - GraphQL: `Tournament` type

### DTOs and validation

Input validation is applied both at the environment level and on GraphQL inputs:

- Env vars are validated through `env.validation.ts` using `class-validator`.
- GraphQL inputs under each module's `dtos/` directory (e.g., `CreatePlayerInput`, `CreateOwnerInput`, `CreateTeamInput`) use `class-validator` decorators to enforce string/number types, length constraints, UUIDs, and optional fields.

When adding new mutations or queries, follow the existing pattern:

- Define an `@InputType()` DTO in the module's `dtos/` folder with appropriate validation decorators.
- Add Drizzle table definition in `src/db/schema/` if new tables are needed.
- Update `src/db/schema/relations.ts` if new relationships are needed.
- Extend the `*.service.ts` with the corresponding business logic.
- Expose GraphQL operations in the `*.resolver.ts` using the DTO and schema types.

## Notes for future Warp usage

- Prefer Yarn for running scripts, matching the existing README and `package.json` scripts.
- Reuse the established module pattern (module + service + resolver + GraphQL schema + DTO + Drizzle schema) when introducing new domains.
- Keep environment validation in sync with any new required configuration keys.
- After modifying Drizzle schemas, run `yarn drizzle-kit generate` to create migrations.
