import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Owner } from './schemas/owner.schema';
import { OwnersService } from './owners.service';
import { CreateOwnerInput } from './dtos/create-owner.input';

@Resolver(() => Owner)
export class OwnersResolver {
  constructor(private ownersService: OwnersService) {}

  @Query(() => [Owner])
  async getAllOwners(): Promise<Owner[]> {
    return this.ownersService.getAllOwners();
  }

  @Query(() => Owner, { nullable: true })
  async getOwnerById(@Args('id') id: string): Promise<Owner | null> {
    return this.ownersService.getOwnerById(id);
  }

  @Query(() => Owner, { nullable: true })
  async getOwnerByEmail(@Args('email') email: string): Promise<Owner | null> {
    return this.ownersService.getOwnerByEmail(email);
  }

  @Mutation(() => Owner)
  async createOwner(
    @Args('createOwnerInput') createOwnerInput: CreateOwnerInput,
  ): Promise<Owner> {
    return this.ownersService.createOwner(createOwnerInput);
  }
}
