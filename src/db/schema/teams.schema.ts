import { pgTable } from 'drizzle-orm/pg-core';
import { ownersTable } from './owners.schema';

export const teamsTable = pgTable('teams', (t) => ({
  id: t.uuid().primaryKey().defaultRandom(),
  name: t.text(),
  ownerId: t
    .uuid()
    .notNull()
    .references(() => ownersTable.id),
}));
