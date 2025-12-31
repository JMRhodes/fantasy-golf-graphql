import { Owner } from './schemas/owner.schema';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { OwnerService } from './owners.service';
import { CreateOwnerInput } from './dtos/create-owner.input';

/**
 * Resolver for the Owner entity
 * @description This resolver handles all the GraphQL queries and mutations for the Owner entity
 */
@Resolver(() => Owner)
export class OwnerResolver {
  constructor(private ownerService: OwnerService) {}
  /**
   * Fetches all owners from the database
   * @returns
   */
  @Query(() => [Owner])
  async getAllOwners(): Promise<Owner[]> {
    try {
      const owners = await this.ownerService.getAllOwners();
      return owners;
    } catch {
      throw new Error('Failed to fetch owners');
    }
  }

  /**
   * Fetches a collection of owners by email
   * @param Args email - The email of the owners to retrieve
   * @returns
   */
  @Query(() => [Owner])
  async getOwnerByEmail(
    @Args('email', { type: () => String }) email: string,
  ): Promise<Owner[]> {
    try {
      const owners = await this.ownerService.getOwnersByEmail(email);
      return owners;
    } catch {
      throw new Error('Failed to fetch owners for the tournament');
    }
  }

  @Mutation(() => Owner)
  async createOwner(@Args('input') input: CreateOwnerInput): Promise<Owner> {
    const owner = await this.ownerService.createOwner(input);
    return owner;
  }
}
