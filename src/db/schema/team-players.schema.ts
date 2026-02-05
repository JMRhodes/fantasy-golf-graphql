import { pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { teamsTable } from './teams.schema';
import { playersTable } from './players.schema';

export const teamPlayersTable = pgTable(
  'team_players',
  (t) => ({
    teamId: t
      .uuid()
      .notNull()
      .references(() => teamsTable.id, { onDelete: 'cascade' }),
    playerId: t
      .uuid()
      .notNull()
      .references(() => playersTable.id),
  }),
  (table) => [primaryKey({ columns: [table.teamId, table.playerId] })],
);
