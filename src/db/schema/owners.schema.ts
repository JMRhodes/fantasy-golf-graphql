import { pgTable } from 'drizzle-orm/pg-core';

export const ownersTable = pgTable('owners', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  name: t.text().notNull(),
  email: t.text().notNull().unique(),
}));
