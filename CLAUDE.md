# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **NestJS GraphQL API** for a fantasy golf application. The API handles data persistence and business logic for managing owners, players, teams, tournaments, and tournament results. Built with NestJS, Apollo Server, Drizzle ORM, and PostgreSQL.

The API exposes a GraphQL endpoint consumed by the Astro frontend located at `../web`.

## Development Commands

```bash
# Install dependencies
yarn install

# Development server with hot-reload
yarn start:dev

# Standard development start (no watch)
yarn start

# Production build
yarn build

# Run production build
yarn start:prod

# Lint and format
yarn lint
yarn format

# Tests
yarn test                    # Run all unit tests
yarn test:watch              # Watch mode
yarn test:cov                # Coverage report
yarn test:e2e                # End-to-end tests
yarn test -- path/to/file.spec.ts  # Run single test file

# Database migrations (Drizzle Kit)
yarn drizzle-kit generate    # Generate migrations from schema changes
yarn drizzle-kit migrate     # Apply migrations to database
yarn drizzle-kit studio      # Open Drizzle Studio (database GUI)

# CLI commands
yarn cli teams --teamsFile ./path/to/file.json
```

## Environment Configuration

Required environment variables (validated via `env.validation.ts`):

- `NODE_ENV` - Environment: `local`, `development`, or `production`
- `PORT` - Server port (0-65535, defaults to 3000)
- `DATABASE_URL` - PostgreSQL connection string

Configuration is centralized via `@nestjs/config` and validated on startup using `class-validator`. If validation fails, the application will throw an error and not start.

## Architecture

### Framework Stack

- **NestJS** (`@nestjs/core`) - Progressive Node.js framework
- **Apollo Server** (`@nestjs/apollo`, `@apollo/server`) - GraphQL server
- **Drizzle ORM** (`drizzle-orm`, `drizzle-orm/postgres-js`) - TypeScript ORM for PostgreSQL
- **nest-commander** - CLI command framework

### Application Module Graph

Entry point: [src/main.ts](src/main.ts) bootstraps [AppModule](src/app.module.ts)

`AppModule` wires together:

- `ConfigModule` - Global environment configuration + validation via [env.validation.ts](env.validation.ts)
- `DrizzlePostgresModule` - PostgreSQL connection using `DATABASE_URL`, injected as `'DB_DEV'`
- `GraphQLModule` - ApolloDriver with code-first schema generation (`autoSchemaFile: true`) and GraphiQL playground enabled
- Feature modules:
  - `OwnersModule` - Owner management
  - `PlayersModule` - Player roster and stats
  - `TeamsModule` - Team creation and player assignments
  - `TournamentsModule` - Tournament management
  - `ResultsModule` - Tournament results and scoring

### Module Pattern

Each feature module follows a consistent NestJS structure:

```
src/{feature}/
├── {feature}.module.ts    # Module registration and dependency injection
├── {feature}.service.ts   # Business logic and database access
├── {feature}.resolver.ts  # GraphQL queries and mutations
├── schemas/               # GraphQL @ObjectType classes
│   └── {feature}.schema.ts
└── dtos/                  # GraphQL @InputType classes with validation
    └── create-{feature}.input.ts
```

- **Module** - Registers providers and exports services
- **Service** - Encapsulates database access via injected `PostgresJsDatabase<typeof schema>` (tagged `'DB_DEV'`)
- **Resolver** - Defines GraphQL API using `@Query()` and `@Mutation()` decorators
- **Schemas** - `@ObjectType()` and `@Field()` decorated classes for GraphQL output types
- **DTOs** - `@InputType()` classes with `class-validator` decorators for input validation

### Database Schema

Database table definitions live in [src/db/schema/](src/db/schema/):

- [players.schema.ts](src/db/schema/players.schema.ts) - Player information (`id`, `name`, `pgaId`, `salary`, `avatarUrl`)
- [owners.schema.ts](src/db/schema/owners.schema.ts) - Fantasy team owners (`id`, `name`, `email`)
- [teams.schema.ts](src/db/schema/teams.schema.ts) - Teams with FK to owners (`id`, `name`, `ownerId`)
- [team-players.schema.ts](src/db/schema/team-players.schema.ts) - Junction table for teams ↔ players many-to-many
- [tournaments.schema.ts](src/db/schema/tournaments.schema.ts) - Tournament info with status enum (`UPCOMING`, `IN-PROGRESS`, `COMPLETED`)
- [results.schema.ts](src/db/schema/results.schema.ts) - Player results per tournament (`tournamentId`, `playerId`, `position`, `points`)
- [relations.ts](src/db/schema/relations.ts) - Drizzle relation definitions for nested queries
- [index.ts](src/db/schema/index.ts) - Re-exports all schemas and relations

### Data Model & Relationships

**Owners** → **Teams** (one-to-many)
- Owners can have multiple teams
- Service methods: `getAllOwners`, `getOwnerById`, `getOwnerByEmail`, `createOwner`

**Teams** ← **TeamPlayers** → **Players** (many-to-many via junction table)
- Teams must have exactly 4 unique players (enforced in `createTeam`)
- Junction table uses composite PK `(teamId, playerId)` to ensure uniqueness
- Service methods: `getAllTeams`, `getTeamById`, `getTeamsByOwnerId`, `createTeam`

**Tournaments** → **Results** ← **Players** (many-to-many via results table)
- Results table tracks player performance per tournament with unique constraint on `(tournamentId, playerId)`
- Includes `position` (text) and `points` (integer) fields
- Service methods in `ResultsModule` handle tournament scoring

**Players**
- Contains PGA player data including `pgaId` for avatar lookups
- GraphQL `Player` type includes computed `totalPoints` field (resolver field)
- Service methods: `getAllPlayers`, `createPlayer`

### GraphQL Schema Generation

- Schema is generated at runtime using the **code-first** approach
- TypeScript classes decorated with `@ObjectType()` and `@Field()` define the schema
- Access GraphQL playground at `http://localhost:3000/graphql` (when GraphiQL is enabled)

### Input Validation

Two levels of validation:

1. **Environment variables** - Validated via `env.validation.ts` using `class-validator` on startup
2. **GraphQL inputs** - DTOs in each module's `dtos/` folder use `class-validator` decorators (`@IsString()`, `@IsUUID()`, `@IsOptional()`, `@MinLength()`, etc.)

### CLI Commands

CLI commands are built with `nest-commander`:

- Implementation: [src/cli/teams/teams.command.ts](src/cli/teams/teams.command.ts)
- Registered as providers in `AppModule`
- Commands are invoked via: `yarn cli <command> [options]`
- Example: `yarn cli teams --teamsFile ./player-rosters.json`

Note: [src/main.ts](src/main.ts:11) calls `CommandFactory.run(AppModule)` which enables CLI mode

## Adding New Features

When adding new mutations, queries, or domains:

1. **Create Drizzle schema** - Add new table definition in `src/db/schema/` if needed
2. **Update relations** - Modify [src/db/schema/relations.ts](src/db/schema/relations.ts) for new relationships
3. **Generate migration** - Run `yarn drizzle-kit generate` to create migration files
4. **Apply migration** - Run `yarn drizzle-kit migrate` to update the database
5. **Create module** - Use NestJS CLI or manually create module following the established pattern
6. **Define GraphQL schema** - Create `@ObjectType()` class in `schemas/` folder
7. **Create DTOs** - Add `@InputType()` classes with validation in `dtos/` folder
8. **Implement service** - Add business logic and Drizzle queries in `*.service.ts`
9. **Implement resolver** - Add `@Query()` and `@Mutation()` methods in `*.resolver.ts`
10. **Register module** - Import new module in [src/app.module.ts](src/app.module.ts)

## Database Workflow

Database is managed by Drizzle Kit (configured in [drizzle.config.ts](drizzle.config.ts)):

1. Modify schema files in `src/db/schema/`
2. Generate migration: `yarn drizzle-kit generate`
3. Review migration in `drizzle/` folder
4. Apply to database: `yarn drizzle-kit migrate`
5. Use Drizzle Studio for GUI inspection: `yarn drizzle-kit studio`

Migration files are stored in the `drizzle/` directory. The schema source is `./src/db/schema`.

## Important Notes

- GraphQL schema uses **code-first** approach - schema is auto-generated from TypeScript classes at runtime
- Database connections are managed via `@knaadh/nestjs-drizzle-postgres` package with tag `'DB_DEV'`
- Services inject the database using `@Inject('DB_DEV')` and type it as `PostgresJsDatabase<typeof schema>`
- Team creation enforces business rule: exactly 4 unique players per team
- Results table enforces unique constraint: one result per player per tournament
- CORS is enabled globally in [src/main.ts](src/main.ts:13)
- Unit tests live alongside source files with `*.spec.ts` naming convention
- E2E tests live in `test/` directory with `*.e2e-spec.ts` naming convention
