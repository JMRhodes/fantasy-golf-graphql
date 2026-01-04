import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from './schemas/team.schema';
import { CreateTeamInput } from './dtos/create-team.input';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

  async createTeam(createTeamInput: CreateTeamInput): Promise<Team> {
    const team = new this.teamModel(createTeamInput);
    return (await team.save()).populate('ownerId');
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
}
