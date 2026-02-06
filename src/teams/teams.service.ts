import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../db/schema';
import { teamsTable, teamPlayersTable, playersTable, resultsTable } from '../db/schema';
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

    // Fetch player stats (totalPoints, totalWins) for all players
    const playerStats = await this.drizzleDev
      .select({
        id: playersTable.id,
        totalPoints: sql<number>`COALESCE(SUM(${resultsTable.points}), 0)`.as(
          'totalPoints',
        ),
        totalWins:
          sql<number>`COALESCE(SUM(CASE WHEN ${resultsTable.position} = '1' THEN 1 ELSE 0 END), 0)`.as(
            'totalWins',
          ),
      })
      .from(playersTable)
      .leftJoin(resultsTable, eq(playersTable.id, resultsTable.playerId))
      .groupBy(playersTable.id);

    // Create a map for quick lookup
    const statsMap = new Map(playerStats.map((stat) => [stat.id, stat]));

    return teams.map((team) => ({
      ...team,
      players: team.teamPlayers.map((tp) => ({
        ...tp.player,
        totalPoints: Number(statsMap.get(tp.player.id)?.totalPoints ?? 0),
        totalWins: Number(statsMap.get(tp.player.id)?.totalWins ?? 0),
      })),
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

    // Fetch player stats for this team's players
    const playerIds = team.teamPlayers.map((tp) => tp.player.id);
    const playerStats = await this.drizzleDev
      .select({
        id: playersTable.id,
        totalPoints: sql<number>`COALESCE(SUM(${resultsTable.points}), 0)`.as(
          'totalPoints',
        ),
        totalWins:
          sql<number>`COALESCE(SUM(CASE WHEN ${resultsTable.position} = '1' THEN 1 ELSE 0 END), 0)`.as(
            'totalWins',
          ),
      })
      .from(playersTable)
      .leftJoin(resultsTable, eq(playersTable.id, resultsTable.playerId))
      .where(sql`${playersTable.id} = ANY(${playerIds})`)
      .groupBy(playersTable.id);

    const statsMap = new Map(playerStats.map((stat) => [stat.id, stat]));

    return {
      ...team,
      players: team.teamPlayers.map((tp) => ({
        ...tp.player,
        totalPoints: Number(statsMap.get(tp.player.id)?.totalPoints ?? 0),
        totalWins: Number(statsMap.get(tp.player.id)?.totalWins ?? 0),
      })),
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

    // Fetch player stats for all players in these teams
    const playerStats = await this.drizzleDev
      .select({
        id: playersTable.id,
        totalPoints: sql<number>`COALESCE(SUM(${resultsTable.points}), 0)`.as(
          'totalPoints',
        ),
        totalWins:
          sql<number>`COALESCE(SUM(CASE WHEN ${resultsTable.position} = '1' THEN 1 ELSE 0 END), 0)`.as(
            'totalWins',
          ),
      })
      .from(playersTable)
      .leftJoin(resultsTable, eq(playersTable.id, resultsTable.playerId))
      .groupBy(playersTable.id);

    const statsMap = new Map(playerStats.map((stat) => [stat.id, stat]));

    return teams.map((team) => ({
      ...team,
      players: team.teamPlayers.map((tp) => ({
        ...tp.player,
        totalPoints: Number(statsMap.get(tp.player.id)?.totalPoints ?? 0),
        totalWins: Number(statsMap.get(tp.player.id)?.totalWins ?? 0),
      })),
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

  /**
   * Get leaderboard with teams sorted by total points (descending)
   * Computes totalPoints and rank for each team
   */
  async getLeaderboard(): Promise<Team[]> {
    const teams = await this.getAllTeams();

    // Calculate totalPoints for each team
    const teamsWithPoints = teams.map((team) => ({
      ...team,
      totalPoints: this.calculateTeamTotalPoints(team),
    }));

    // Sort by totalPoints descending (highest first)
    teamsWithPoints.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranks with tie handling (standard competition ranking: 1, 2, 2, 4)
    let currentRank = 1;
    for (let i = 0; i < teamsWithPoints.length; i++) {
      if (i > 0 && teamsWithPoints[i].totalPoints < teamsWithPoints[i - 1].totalPoints) {
        currentRank = i + 1; // Jump rank after ties
      }
      teamsWithPoints[i].rank = currentRank;
    }

    return teamsWithPoints;
  }

  /**
   * Calculate total points for a team (sum of all players' totalPoints)
   */
  calculateTeamTotalPoints(team: Team): number {
    if (!team.players || team.players.length === 0) {
      return 0;
    }
    return team.players.reduce(
      (sum, player) => sum + (player.totalPoints || 0),
      0,
    );
  }
}
