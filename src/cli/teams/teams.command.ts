import { Command, CommandRunner, Option } from 'nest-commander';
import * as fs from 'fs';
import * as path from 'path';
import { TeamsService } from '../../teams/teams.service';
import { OwnersService } from '../../owners/owners.service';
import { PlayersService } from '../../players/players.service';
import { CreateOwnerInput } from '../../owners/dtos/create-owner.input';
import { CreatePlayerInput } from '../../players/dtos/create-player.input';
import { CreateTeamInput } from '../../teams/dtos/create-team.input';

interface BasicCommandOptions {
  teamsFile?: string;
}

interface TeamData {
  name: string;
  owner: {
    name: string;
    email: string;
  };
  players: Array<{
    name: string;
  }>;
}

@Command({ name: 'teams', description: 'Manage teams' })
export class TeamsCommand extends CommandRunner {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly ownersService: OwnersService,
    private readonly playersService: PlayersService,
  ) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: BasicCommandOptions,
  ): Promise<void> {
    // validate the json file path if provided
    if (!options?.teamsFile) {
      console.error('Error: --teamsFile option is required');
      console.log(
        'Usage: npm run cli teams -- -f path/to/teams_players_data.json',
      );
      process.exit(1);
    }

    try {
      console.log(`🔍 Reading teams file: ${options.teamsFile}\n`);

      // Validate file exists
      if (!fs.existsSync(options.teamsFile)) {
        throw new Error(`File not found: ${options.teamsFile}`);
      }

      // Read and parse the JSON file
      const rawData = fs.readFileSync(options.teamsFile, 'utf8');
      const teamsData = JSON.parse(rawData) as TeamData[];

      console.log(`📊 Found ${teamsData.length} teams to import\n`);

      let successCount = 0;
      let errorCount = 0;

      // Process each team
      for (let i = 0; i < teamsData.length; i++) {
        const teamData = teamsData[i];
        console.log(
          `[${i + 1}/${teamsData.length}] Processing team: ${teamData.name}`,
        );

        try {
          // Step 1: Find or create the owner
          const owner = await this.findOrCreateOwner(teamData.owner);
          console.log(`  ✓ Owner: ${owner.name} (${owner.email})`);

          // Step 2: Find or create each player
          const playerIds: string[] = [];
          for (const playerData of teamData.players) {
            const player = await this.findOrCreatePlayer(playerData.name);
            playerIds.push(player.id);
            console.log(`  ✓ Player: ${player.name}`);
          }

          // Validate we have exactly 4 players
          if (playerIds.length !== 4) {
            throw new Error(
              `Team must have exactly 4 players, found ${playerIds.length}`,
            );
          }

          // Step 3: Create the team
          const createTeamInput: CreateTeamInput = {
            name: teamData.name,
            ownerId: owner.id,
            playerIds,
          };

          const team = await this.teamsService.createTeam(createTeamInput);
          console.log(`  ✅ Team created: ${team.name} (ID: ${team.id})\n`);

          successCount++;
        } catch (error) {
          errorCount++;
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error(`  ❌ Error creating team: ${errorMessage}\n`);
        }
      }

      // Summary
      console.log('━'.repeat(50));
      console.log(`\n📈 Import Summary:`);
      console.log(`  ✅ Successfully imported: ${successCount} teams`);
      console.log(`  ❌ Failed: ${errorCount} teams`);
      console.log(`  📊 Total: ${teamsData.length} teams\n`);

      process.exit(errorCount > 0 ? 1 : 0);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Fatal error:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Find an owner by email, or create if not found
   */
  private async findOrCreateOwner(ownerData: { name: string; email: string }) {
    // Try to find existing owner by email
    let owner = await this.ownersService.getOwnerByEmail(ownerData.email);

    if (!owner) {
      // Create new owner
      const createOwnerInput: CreateOwnerInput = {
        name: ownerData.name,
        email: ownerData.email,
      };
      owner = await this.ownersService.createOwner(createOwnerInput);
    }

    return owner;
  }

  /**
   * Find a player by name, or create if not found
   */
  private async findOrCreatePlayer(playerName: string) {
    // Get all players and find by name
    const allPlayers = await this.playersService.getAllPlayers();
    let player = allPlayers.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase(),
    );

    if (!player) {
      // Create new player with default values
      const createPlayerInput: CreatePlayerInput = {
        name: playerName,
        pgaId: 0,
        salary: 0,
      };
      player = await this.playersService.createPlayer(createPlayerInput);
    }

    return player;
  }

  @Option({
    flags: '-f, --teamsFile [teamsFile]',
    description: 'Path to the teams file',
  })
  parseTeamsFile(val: string): string {
    return val;
  }
}
