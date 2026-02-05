import { Module } from '@nestjs/common';
import { TournamentResolver } from './tournaments.resolver';
import { TournamentService } from './tournaments.service';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [ResultsModule],
  providers: [TournamentResolver, TournamentService],
  exports: [TournamentService],
})
export class TournamentsModule {}
