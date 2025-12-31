import { Injectable } from '@nestjs/common';
import { Owner } from './schemas/owner.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * The service for managing owners.
 * @constructor
 * @Injectableparam ownerModel - The Mongoose model for the Owner schema.
 */
@Injectable()
export class OwnerService {
  constructor(@InjectModel(Owner.name) private ownerModel: Model<Owner>) {}

  /**
   * Retrieves all owners from the database.
   *
   * @returns
   */
  async getAllOwners(): Promise<Owner[]> {
    return this.ownerModel.find().exec();
  }

  /**
   * Retrieves a collection of owners by their email.
   *
   * @param email - The email of the owners to retrieve.
   * @throws Error if the owners are not found.
   * @returns
   */
  async getOwnersByEmail(email: string): Promise<Owner[]> {
    const owners = await this.ownerModel.find({ email }).exec();
    if (!owners) {
      throw new Error(`Owners for email ${email} not found`);
    }

    return owners;
  }

  async createOwner(input: any): Promise<Owner> {
    const newOwner = new this.ownerModel(input);
    await newOwner.save();
    return newOwner;
  }
}
