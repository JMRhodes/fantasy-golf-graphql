import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { teamsTable, teamPlayersTable } from '../db/schema';
import { Team } from './schemas/team.schema';
import { CreateTeamInput } from './dtos/create-team.input';

@Injectable()
export class TeamsService {
  constructor(
    @Inject('DB_DEV')
    private drizzleDev: PostgresJsDatabase<typeof schema>,
  ) {}

  async getAllTeams(): Promise<Team[]> {
    const teams = await this.drizzleDev.query.teamsTable.findMany({
      with: {
        owner: true,
        teamPlayers: {
          with: {
            player: true,
          },
        },
      },
    });

    return teams.map((team) => ({
      ...team,
      players: team.teamPlayers.map((tp) => tp.player),
    })) as Team[];
  }

  async getTeamById(id: string): Promise<Team | null> {
    const team = await this.drizzleDev.query.teamsTable.findFirst({
      where: eq(teamsTable.id, id),
      with: {
        owner: true,
        teamPlayers: {
          with: {
            player: true,
          },
        },
      },
    });

    if (!team) return null;

    return {
      ...team,
      players: team.teamPlayers.map((tp) => tp.player),
    } as Team;
  }

  async getTeamsByOwnerId(ownerId: string): Promise<Team[]> {
    const teams = await this.drizzleDev.query.teamsTable.findMany({
      where: eq(teamsTable.ownerId, ownerId),
      with: {
        owner: true,
        teamPlayers: {
          with: {
            player: true,
          },
        },
      },
    });

    return teams.map((team) => ({
      ...team,
      players: team.teamPlayers.map((tp) => tp.player),
    })) as Team[];
  }

  async createTeam(teamData: CreateTeamInput): Promise<Team> {
    const { playerIds, ...teamFields } = teamData;

    // Validate exactly 4 unique players
    const uniquePlayerIds = [...new Set(playerIds)];
    if (uniquePlayerIds.length !== 4) {
      throw new Error('Team must have exactly 4 unique players');
    }

    // Insert the team
    const [newTeam] = await this.drizzleDev
      .insert(teamsTable)
      .values(teamFields)
      .returning();

    // Insert team-player relationships
    await this.drizzleDev.insert(teamPlayersTable).values(
      uniquePlayerIds.map((playerId) => ({
        teamId: newTeam.id,
        playerId,
      })),
    );

    // Return the team with relations
    return this.getTeamById(newTeam.id) as Promise<Team>;
  }
}
