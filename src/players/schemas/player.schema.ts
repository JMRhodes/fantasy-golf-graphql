import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { HydratedDocument } from 'mongoose';

export type PlayerDocument = HydratedDocument<Player>;

@ObjectType() // GraphQL Object Type decorator
@Schema({ timestamps: true }) // Mongoose Schema decorator
export class Player {
  @Field(() => ID) // GraphQL Field for the 'id' (MongoDB's _id)
  id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ default: 0 })
  pgaId: number;

  @Field()
  @Prop()
  salary: number;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
