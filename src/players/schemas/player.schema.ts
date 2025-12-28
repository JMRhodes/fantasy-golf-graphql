import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { HydratedDocument } from 'mongoose';
import { IsOptional } from 'class-validator';

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
  @IsOptional()
  @Prop({ required: false, default: 0, nullable: true })
  pgaId: number;

  @Field()
  @Prop()
  salary: number;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
