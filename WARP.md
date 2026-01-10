# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

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

### Local MongoDB via Docker

MongoDB is provided via the local Docker setup:

- Start MongoDB in the background:
  - `docker compose up -d`
- Stop MongoDB:
  - `docker compose down`

The `docker-compose.yml` file defines a `mongo` service built from the root `Dockerfile`, exposing `27017` and configuring:

- `MONGO_INITDB_ROOT_USERNAME=fantasygolf`
- `MONGO_INITDB_ROOT_PASSWORD=fantasygolf`
- `MONGO_INITDB_DATABASE=fantasygolf`

Set `MONGO_URI` in your `.env` (see `.env.example`) to point at this Mongo instance using the above credentials.

## Environment and configuration

Configuration is centralized via `@nestjs/config` and validated by `env.validation.ts`:

- `.env.example` documents the required variables:
  - `NODE_ENV` (one of: `local`, `development`, `production`)
  - `PORT` (0–65535)
  - `MONGO_URI` (MongoDB connection string)
- `ConfigModule.forRoot` (in `src/app.module.ts`) loads process env vars, applies `validate`, and makes them globally available.
- `MongooseModule.forRootAsync` reads `MONGO_URI` from `ConfigService` to connect to MongoDB.

If validation fails (missing or invalid env vars), the app will throw on startup.

## High-level architecture

### Framework and runtime

- This is a NestJS (`@nestjs/core`) GraphQL API using the Apollo driver (`@nestjs/apollo`, `@apollo/server`).
- Persistence is handled via Mongoose (`@nestjs/mongoose`, `mongoose`) against a MongoDB instance.
- The GraphQL schema is generated at runtime (`autoSchemaFile: true` in `src/app.module.ts`), based on decorators on TypeScript classes.

### Application module graph

The root module is `AppModule` (`src/app.module.ts`), which wires together:

- `ConfigModule` (global env configuration + validation via `env.validation.ts`)
- `MongooseModule` (MongoDB connection using `MONGO_URI`)
- `GraphQLModule` (ApolloDriver with code-first schema generation and GraphiQL enabled)
- Domain feature modules:
  - `OwnersModule`
  - `PlayersModule`
  - `ResultsModule`
  - `TeamsModule`
  - `TournamentsModule`

Each feature module follows a consistent Nest pattern:

- `*.module.ts` – registers Mongoose models via `MongooseModule.forFeature` and exposes providers.
- `*.service.ts` – encapsulates MongoDB data access via injected `Model<T>` instances.
- `*.resolver.ts` – defines the GraphQL API (queries and mutations) using decorators over the corresponding schema classes and DTOs.

### GraphQL + Mongoose data model

The domain model is expressed twice for each aggregate:

- **GraphQL types** – `@ObjectType()` and `@Field()`-annotated classes under each module's `schemas/` directory.
- **Mongoose schemas** – `@Schema()` and `@Prop()` on the same classes, with `SchemaFactory.createForClass` producing actual schemas.

Key aggregates and relationships:

- **Owners** (`src/owners`)
  - `Owner` schema: name and unique email, with timestamps.
  - `OwnerService` provides `getAllOwners`, `getOwnersByEmail`, and `createOwner`.
  - `OwnerResolver` exposes queries for all owners / owners by email, plus a mutation to create owners.

- **Players** (`src/players`)
  - `Player` schema: name, optional PGA id, salary; timestamps.
  - `PlayersService` provides CRUD-style operations: create single, create bulk, list all, get by id.
  - `PlayersResolver` exposes queries for all players and by id, and mutations for creating one or many players.
  - `player-rosters.json` is a large static list of player name + salary data that can be used for seeding.

- **Results** (`src/results`)
  - `Result` schema: references a `Player` (`player` field, `ObjectId` ref), position, and points.
  - `ResultService` returns all results, populating `player` on each.
  - `ResultResolver` exposes a `getAllResults` query. (Tournament-scoped result queries are scaffolded but commented out.)

- **Teams** (`src/teams`)
  - `Team` schema: optional name and an `ownerId` referencing an `Owner` document.
  - `TeamsService` handles creation and retrieval, always populating the `ownerId` reference.
  - `TeamsResolver` exposes mutations to create teams and queries to fetch all teams or by id.

- **Tournaments** (`src/tournaments`)
  - `Tournament` schema: name, optional description, status (`TournamentStatusEnum`), start/end dates, and an array of `results` referencing `Result` documents.
  - `TournamentService` supports:
    - Creating tournaments.
    - Getting all tournaments or a single tournament by id, with `results` and nested `player` populated.
    - `addResultsToTournament`, which:
      - Creates `Result` documents from `CreateResultInput[]`.
      - Appends their `ObjectId`s to `tournament.results`.
      - Saves and re-populates `results` (and nested players) before returning.
  - `TournamentResolver` exposes queries for all tournaments and by id, plus mutations for creating tournaments and adding results.

### DTOs and validation

Input validation is applied both at the environment level and on GraphQL inputs:

- Env vars are validated through `env.validation.ts` using `class-validator`.
- GraphQL inputs under each module's `dtos/` directory (e.g., `CreatePlayerInput`, `CreateTournamentInput`, `CreateResultInput`, `CreateOwnerInput`, `CreateTeamInput`) use `class-validator` decorators to enforce string/number types, length constraints, and optional fields.

When adding new mutations or queries, follow the existing pattern:

- Define an `@InputType()` DTO in the module's `dtos/` folder with appropriate validation decorators.
- Extend the `*.service.ts` with the corresponding business logic.
- Expose GraphQL operations in the `*.resolver.ts` using the DTO and schema types.

## Notes for future Warp usage

- Prefer Yarn for running scripts, matching the existing README and `package.json` scripts.
- Reuse the established module pattern (module + service + resolver + schema + DTO) when introducing new domains.
- Keep environment validation in sync with `.env.example` and any new required configuration keys.
