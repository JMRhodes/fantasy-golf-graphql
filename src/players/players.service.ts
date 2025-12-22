import { Injectable } from '@nestjs/common';
import { CreatePlayerInput } from './dtos/create-player.input';
import { Player } from './schemas/player.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * The service for managing players.
 * @constructor
 * @Injectableparam playerModel - The Mongoose model for the Player schema.
 */
@Injectable()
export class PlayersService {
  constructor(@InjectModel(Player.name) private playerModel: Model<Player>) {}

  /**
   * Creates a new player in the database.
   *
   * @param createPlayerInput - The input data for creating a new player.
   * @returns
   */
  async createPlayer(createPlayerInput: CreatePlayerInput): Promise<Player> {
    const player = new this.playerModel(createPlayerInput);
    return player.save();
  }

  /**
   * Retrieves all players from the database.
   *
   * @returns
   */
  async getAllPlayers(): Promise<Player[]> {
    return this.playerModel.find().exec();
  }

  /**
   * Retrieves a player by their ID.
   *
   * @param id - The ID of the player to retrieve.
   * @throws Error if the player is not found.
   * @returns
   */
  async getPlayerById(id: string): Promise<Player> {
    const player = await this.playerModel.findById(id).exec();
    if (!player) {
      throw new Error(`Player with ID ${id} not found`);
    }

    return player;
  }
}
