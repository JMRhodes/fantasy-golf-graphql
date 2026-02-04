import { Module } from '@nestjs/common';
import { TournamentResolver } from './tournaments.resolver';
import { TournamentService } from './tournaments.service';

@Module({
  providers: [TournamentResolver, TournamentService],
  exports: [TournamentService],
})
export class TournamentsModule {}
