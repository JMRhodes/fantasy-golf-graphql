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
   * @returns The newly created player.
   */
  async createPlayer(createPlayerInput: CreatePlayerInput): Promise<Player> {
    const player = new this.playerModel(createPlayerInput);
    await player.save();

    return player;
  }

  /**
   * Creates multiple players in the database.
   *
   * @param createPlayerInputs - Array of input data for creating new players.
   * @returns The newly created players.
   */
  async createPlayersBulk(
    createPlayerInputs: CreatePlayerInput[],
  ): Promise<Player[]> {
    const createdPlayers =
      await this.playerModel.insertMany(createPlayerInputs);

    return createdPlayers as Player[];
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
