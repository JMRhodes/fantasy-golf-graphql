import { Injectable } from '@nestjs/common';
import { Result } from './schemas/result.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * The service for managing results.
 * @constructor
 * @Injectableparam resultModel - The Mongoose model for the Result schema.
 */
@Injectable()
export class ResultService {
  constructor(@InjectModel(Result.name) private resultModel: Model<Result>) {}

  /**
   * Retrieves all results from the database.
   *
   * @returns
   */
  async getAllResults(): Promise<Result[]> {
    return this.resultModel.find().exec();
  }

  // /**
  //  * Retrieves a collection of results by their tournament ID.
  //  *
  //  * @param id - The ID of the tournament to retrieve.
  //  * @throws Error if the tournament is not found.
  //  * @returns
  //  */
  // async getResultsByTournamentId(id: string): Promise<Result[]> {
  //   const results = await this.resultModel.find({ tournamentId: id }).exec();
  //   if (!results) {
  //     throw new Error(`Results for tournament with ID ${id} not found`);
  //   }

  //   return results;
  // }
}
