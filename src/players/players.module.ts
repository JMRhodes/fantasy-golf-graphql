import { Module } from '@nestjs/common';
import { PlayersResolver } from './players.resolver';

@Module({
  providers: [PlayersResolver],
})
export class PlayersModule {}
