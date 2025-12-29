import { Injectable } from '@nestjs/common';
import { Tournament } from './schemas/tournament.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTournamentInput } from './dtos/create-tournament.dto';

/**
 * The service for managing tournaments.
 * @constructor
 * @Injectableparam tournamentModel - The Mongoose model for the Tournament schema.
 */
@Injectable()
export class TournamentService {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<Tournament>,
  ) {}

  /**
   * Creates a new tournament in the database.
   *
   * @param createTournamentInput - The input data for creating a new tournament.
   * @returns The newly created tournament.
   */
  async createTournament(
    createTournamentInput: CreateTournamentInput,
  ): Promise<Tournament> {
    const tournament = new this.tournamentModel(createTournamentInput);
    await tournament.save();

    return tournament;
  }

  /**
   * Retrieves all tournaments from the database.
   *
   * @returns
   */
  async getAllTournaments(): Promise<Tournament[]> {
    return this.tournamentModel.find().exec();
  }

  /**
   * Retrieves a tournament by their ID.
   *
   * @param id - The ID of the tournament to retrieve.
   * @throws Error if the tournament is not found.
   * @returns
   */
  async getTournamentById(id: string): Promise<Tournament> {
    const tournament = await this.tournamentModel.findById(id).exec();
    if (!tournament) {
      throw new Error(`Tournament with ID ${id} not found`);
    }

    return tournament;
  }
}
