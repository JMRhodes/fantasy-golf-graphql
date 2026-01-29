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

  /**
   * Finds an owner by email, or creates a new one if it doesn't exist.
   *
   * @param input - The owner data (name and email)
   * @returns The existing or newly created owner
   */
  async findOrCreateOwner(input: {
    name?: string;
    email: string;
  }): Promise<Owner> {
    // Try to find existing owner by email
    let owner = await this.ownerModel.findOne({ email: input.email }).exec();

    if (!owner) {
      // Owner doesn't exist, create new one
      owner = new this.ownerModel(input);
      await owner.save();
    }

    return owner;
  }
}
