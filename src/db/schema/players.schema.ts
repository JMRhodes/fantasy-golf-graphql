import { pgTable } from 'drizzle-orm/pg-core';

export const playersTable = pgTable('players', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  name: t.text().notNull(),
  pgaId: t.integer().default(0),
  salary: t.integer().default(0),
  avatarUrl: t.text(),
}));
