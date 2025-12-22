import { Injectable } from '@nestjs/common';
import { CreatePlayerInput } from './dtos/create-player.input';
import { Player } from './schemas/player.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PlayersService {
  constructor(@InjectModel(Player.name) private playerModel: Model<Player>) {}

  async createPlayer(createPlayerInput: CreatePlayerInput): Promise<Player> {
    const player = new this.playerModel(createPlayerInput);
    return player.save();
  }

  async getAllPlayers(): Promise<Player[]> {
    return this.playerModel.find().exec();
  }

  async getPlayerById(id: string): Promise<Player> {
    const player = await this.playerModel.findById(id).exec();
    if (!player) {
      throw new Error(`Player with ID ${id} not found`);
    }

    return player;
  }
}
