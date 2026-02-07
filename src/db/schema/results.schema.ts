import { pgTable, unique } from 'drizzle-orm/pg-core';
import { tournamentsTable } from './tournaments.schema';
import { playersTable } from './players.schema';

export const resultsTable = pgTable(
  'results',
  (t) => ({
    id: t.uuid().primaryKey().defaultRandom(),
    tournamentId: t
      .uuid()
      .notNull()
      .references(() => tournamentsTable.id, { onDelete: 'cascade' }),
    playerId: t
      .uuid()
      .notNull()
      .references(() => playersTable.id, { onDelete: 'cascade' }),
    position: t.text().notNull(),
    points: t.integer().notNull().default(0),
  }),
  (table) => [unique().on(table.tournamentId, table.playerId)],
);
