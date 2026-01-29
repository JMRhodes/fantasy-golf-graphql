import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from './schemas/team.schema';
import { CreateTeamInput } from './dtos/create-team.input';
import { OwnerService } from '../owners/owners.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<Team>,
    private ownerService: OwnerService,
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

    const team = new this.teamModel({
      name: createTeamInput.name,
      ownerId,
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
    return this.teamModel.find().populate('ownerId').exec();
  }

  async getTeamById(id: string): Promise<Team> {
    const team = await this.teamModel.findById(id).populate('ownerId').exec();
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
