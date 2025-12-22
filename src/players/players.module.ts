import { Module } from '@nestjs/common';
import { PlayersResolver } from './players.resolver';
import { PlayersService } from './players.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerSchema } from './schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Player', schema: PlayerSchema }]),
  ],
  providers: [PlayersResolver, PlayersService],
})
export class PlayersModule {}
