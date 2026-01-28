import { Injectable } from '@nestjs/common';
import { Tournament } from './schemas/tournament.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTournamentInput } from './dtos/create-tournament.dto';
import { CreateResultInput } from 'src/results/dtos/create-result.input';
import { Result } from 'src/results/schemas/result.schema';

/**
 * The service for managing tournaments.
 * @constructor
 * @Injectableparam tournamentModel - The Mongoose model for the Tournament schema.
 */
@Injectable()
export class TournamentService {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<Tournament>,
    @InjectModel(Result.name) private resultModel: Model<Result>,
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
    return this.tournamentModel
      .find()
      .populate({ path: 'results', populate: { path: 'player' } })
      .exec();
  }

  /**
   * Retrieves a tournament by their ID.
   *
   * @param id - The ID of the tournament to retrieve.
   * @throws Error if the tournament is not found.
   * @returns
   */
  async getTournamentById(id: string): Promise<Tournament> {
    const tournament = await this.tournamentModel
      .findById(id)
      .populate({ path: 'results', populate: { path: 'player' } })
      .exec();
    if (!tournament) {
      throw new Error(`Tournament with ID ${id} not found`);
    }

    return tournament;
  }

  /**
   * Adds one or more results to a tournament and stores them as referenced Result documents.
   */
  async addResultsToTournament(
    id: string,
    resultsInput: CreateResultInput[],
  ): Promise<Tournament> {
    const tournament = await this.tournamentModel.findById(id).exec();

    if (!tournament) {
      throw new Error(`Tournament with ID ${id} not found`);
    }

    // 1) Create Result documents
    const createdResults = await this.resultModel.insertMany(
      resultsInput.map(
        (result): CreateResultInput => ({
          player: result.player,
          position: result.position,
          points: result.points ?? 0,
        }),
      ),
    );

    const resultIds = createdResults.map((result) => result._id);

    // 2) Ensure results is an array of ObjectId refs and append the new IDs
    const currentResults = Array.isArray(tournament.results)
      ? (tournament.results as unknown as Types.ObjectId[])
      : [];

    // At this point results is an array of ObjectId references; cast so TypeScript
    // accepts the assignment while Mongoose continues to store refs correctly.
    tournament.results = [
      ...currentResults,
      ...resultIds,
    ] as unknown as Result[];

    await tournament.save();

    // 3) Populate results and nested players so GraphQL returns full objects
    await tournament.populate({
      path: 'results',
      populate: { path: 'player' },
    });

    return tournament;
  }
}
