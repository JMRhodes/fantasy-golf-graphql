import { Module } from '@nestjs/common';
import { TournamentResolver } from './tournaments.resolver';
import { TournamentService } from './tournaments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentSchema } from './schemas/tournament.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tournament', schema: TournamentSchema },
    ]),
  ],
  providers: [TournamentResolver, TournamentService],
})
export class TournamentsModule {}
