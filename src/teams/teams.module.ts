import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';
import { TeamSchema } from './schemas/team.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Team', schema: TeamSchema }])],
  providers: [TeamsResolver, TeamsService],
})
export class TeamsModule {}
