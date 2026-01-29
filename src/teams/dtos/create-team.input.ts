import { InputType, Field, ID } from '@nestjs/graphql';
import { ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OwnerInput } from './owner-input.dto';

@InputType()
export class CreateTeamInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => ID, { nullable: true })
  @ValidateIf((owner: CreateTeamInput) => !owner.owner)
  ownerId?: string;

  @Field(() => OwnerInput, { nullable: true })
  @ValidateIf((owner: CreateTeamInput) => !owner.ownerId)
  @ValidateNested()
  @Type(() => OwnerInput)
  owner?: OwnerInput;
}
