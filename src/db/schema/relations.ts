import { relations } from 'drizzle-orm';
import { ownersTable } from './owners.schema';
import { teamsTable } from './teams.schema';
import { teamPlayersTable } from './team-players.schema';
import { playersTable } from './players.schema';
import { tournamentsTable } from './tournaments.schema';
import { resultsTable } from './results.schema';

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
  results: many(resultsTable),
}));

export const tournamentsRelations = relations(tournamentsTable, ({ many }) => ({
  results: many(resultsTable),
}));

export const resultsRelations = relations(resultsTable, ({ one }) => ({
  tournament: one(tournamentsTable, {
    fields: [resultsTable.tournamentId],
    references: [tournamentsTable.id],
  }),
  player: one(playersTable, {
    fields: [resultsTable.playerId],
    references: [playersTable.id],
  }),
}));
