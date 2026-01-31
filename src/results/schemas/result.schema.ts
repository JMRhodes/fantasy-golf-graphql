import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { HydratedDocument, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Player } from 'src/players/schemas/player.schema';

export type ResultDocument = HydratedDocument<Result>;

@ObjectType() // GraphQL Object Type decorator
@Schema({ timestamps: true }) // Mongoose Schema decorator
export class Result {
  @Field(() => ID) // GraphQL Field for the 'id' (MongoDB's _id)
  id: string;

  @Field(() => Player, { nullable: false })
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  })
  player: Types.ObjectId | Player;

  @Field({ nullable: true })
  @Prop({ required: true })
  position: string;

  @Field()
  @Prop({ required: true, default: 0 })
  points: number;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
