import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from './schemas/team.schema';
import { CreateTeamInput } from './dtos/create-team.input';
import { OwnerService } from '../owners/owners.service';
import { PlayersService } from '../players/players.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<Team>,
    private ownerService: OwnerService,
    private playersService: PlayersService,
  ) {}

  async createTeam(createTeamInput: CreateTeamInput): Promise<Team> {
    let ownerId: string;

    // If owner data is provided, find or create the owner
    if (createTeamInput.owner) {
      const owner = await this.ownerService.findOrCreateOwner(
        createTeamInput.owner,
      );
      ownerId = owner.id;
    } else if (createTeamInput.ownerId) {
      ownerId = createTeamInput.ownerId;
    } else {
      throw new Error('Either ownerId or owner must be provided');
    }

    // Handle players if provided
    const playerIds: string[] = [];
    if (createTeamInput.players && createTeamInput.players.length > 0) {
      for (const playerInput of createTeamInput.players) {
        let playerId: string;

        // If player ID is provided, use it directly
        if (playerInput.playerId) {
          playerId = playerInput.playerId;
        } else if (playerInput.name) {
          const playerInputType: {
            name: string;
          } = {
            name: playerInput.name,
          };
          // Otherwise, find or create player by name
          const player =
            await this.playersService.findOrCreatePlayer(playerInputType);
          playerId = (player as { id: string }).id;
        } else {
          throw new Error(
            'Either playerId or name must be provided for each player',
          );
        }

        playerIds.push(playerId);
      }
    }

    const team = new this.teamModel({
      name: createTeamInput.name,
      ownerId,
      players: playerIds,
    });
    return (await team.save()).populate('ownerId');
  }

  async createTeams(createTeamInputs: CreateTeamInput[]): Promise<Team[]> {
    const teams: Team[] = [];

    for (const input of createTeamInputs) {
      const team = await this.createTeam(input);
      teams.push(team);
    }

    return teams;
  }

  async getAllTeams(): Promise<Team[]> {
    return this.teamModel.find().populate('ownerId').populate('players').exec();
  }

  async getTeamById(id: string): Promise<Team> {
    const team = await this.teamModel
      .findById(id)
      .populate('ownerId')
      .populate('players')
      .exec();
    if (!team) {
      throw new Error(`Team with ID ${id} not found`);
    }

    return team;
  }

  async deleteTeamById(id: string): Promise<void> {
    const result = await this.teamModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new Error(`Team with ID ${id} not found`);
    }
  }
}
