import { relations } from 'drizzle-orm';
import { ownersTable } from './owners.schema';
import { teamsTable } from './teams.schema';
import { teamPlayersTable } from './team-players.schema';
import { playersTable } from './players.schema';

export const ownersRelations = relations(ownersTable, ({ many }) => ({
  teams: many(teamsTable),
}));

export const teamsRelations = relations(teamsTable, ({ one, many }) => ({
  owner: one(ownersTable, {
    fields: [teamsTable.ownerId],
    references: [ownersTable.id],
  }),
  teamPlayers: many(teamPlayersTable),
}));

export const teamPlayersRelations = relations(teamPlayersTable, ({ one }) => ({
  team: one(teamsTable, {
    fields: [teamPlayersTable.teamId],
    references: [teamsTable.id],
  }),
  player: one(playersTable, {
    fields: [teamPlayersTable.playerId],
    references: [playersTable.id],
  }),
}));

export const playersRelations = relations(playersTable, ({ many }) => ({
  teamPlayers: many(teamPlayersTable),
}));
