import { pgTable, pgEnum } from 'drizzle-orm/pg-core';

export const TournamentStatusEnum = pgEnum('status', [
  'UPCOMING',
  'IN-PROGRESS',
  'COMPLETED',
]);

export const tournamentsTable = pgTable('tournaments', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  name: t.text().notNull(),
  description: t.text(),
  status: TournamentStatusEnum().notNull().default('UPCOMING'),
  avatarUrl: t.text(),
  startDate: t.timestamp().notNull(),
  endDate: t.timestamp().notNull(),
}));
