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
}
