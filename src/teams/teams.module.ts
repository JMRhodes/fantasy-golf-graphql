import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';
import { TeamSchema } from './schemas/team.schema';
import { OwnersModule } from '../owners/owners.module';
import { PlayersModule } from '../players/players.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Team', schema: TeamSchema }]),
    OwnersModule,
    PlayersModule,
  ],
  providers: [TeamsResolver, TeamsService],
})
export class TeamsModule {}
