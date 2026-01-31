import { Module } from '@nestjs/common';
import { PlayersResolver } from './players.resolver';
import { PlayersService } from './players.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerSchema } from './schemas/player.schema';
import { ResultsModule } from 'src/results/results.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Player', schema: PlayerSchema }]),
    ResultsModule,
  ],
  providers: [PlayersResolver, PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
