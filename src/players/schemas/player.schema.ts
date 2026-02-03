import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Prop({ required: false, default: null, nullable: true })
  avatarUrl: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
