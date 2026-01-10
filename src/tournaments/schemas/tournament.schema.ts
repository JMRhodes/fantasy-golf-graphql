import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { HydratedDocument, Types } from 'mongoose';
import { IsOptional } from 'class-validator';
import { Result } from 'src/results/schemas/result.schema';

export type TournamentDocument = HydratedDocument<Tournament>;

export type TournamentStatusEnum = 'UPCOMING' | 'IN-PROGRESS' | 'COMPLETED';

@ObjectType() // GraphQL Object Type decorator
@Schema({ timestamps: true }) // Mongoose Schema decorator
export class Tournament {
  @Field(() => ID) // GraphQL Field for the 'id' (MongoDB's _id)
  id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @IsOptional()
  @Prop({ required: false, default: '', nullable: true })
  description: string;

  @Field()
  @Prop({ required: true })
  status: TournamentStatusEnum;

  @Field(() => Date)
  @Prop({ required: true })
  start_date: Date;

  @Field(() => Date)
  @Prop({ required: true })
  end_date: Date;

  @Field(() => [Result], { nullable: true })
  @IsOptional()
  @Prop({
    type: [{ type: Types.ObjectId, ref: Result.name }],
    default: [],
  })
  results?: Result[];
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
