import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Owner } from 'src/owners/schemas/owner.schema';
import { Player } from 'src/players/schemas/player.schema';

export type TeamDocument = HydratedDocument<Team>;

@ObjectType() // GraphQL Object Type decorator
@Schema({
  timestamps: true,
}) // Mongoose Schema decorator
export class Team {
  @Field(() => ID) // GraphQL Field for the 'id' (MongoDB's _id)
  id: string;

  @Field({ nullable: true })
  @Prop()
  name?: string;

  @Field(() => Owner, { nullable: false })
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Owner',
    required: true,
  })
  ownerId: Owner;

  @Field(() => [Player], { nullable: 'itemsAndList' })
  @Prop([
    {
      type: MongooseSchema.Types.ObjectId,
      ref: 'Player',
    },
  ])
  players: Player[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
