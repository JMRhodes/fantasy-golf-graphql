import { Module } from '@nestjs/common';
import { TournamentResolver } from './tournaments.resolver';
import { TournamentService } from './tournaments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentSchema } from './schemas/tournament.schema';
import { ResultSchema } from 'src/results/schemas/result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tournament', schema: TournamentSchema },
      { name: 'Result', schema: ResultSchema },
    ]),
  ],
  providers: [TournamentResolver, TournamentService],
})
export class TournamentsModule {}
