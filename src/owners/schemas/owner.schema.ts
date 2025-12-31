import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { HydratedDocument } from 'mongoose';

export type OwnerDocument = HydratedDocument<Owner>;

@ObjectType() // GraphQL Object Type decorator
@Schema({ timestamps: true }) // Mongoose Schema decorator
export class Owner {
  @Field(() => ID) // GraphQL Field for the 'id' (MongoDB's _id)
  id: string;

  @Field({ nullable: true })
  @Prop({ required: true })
  name: string;

  @Field({ nullable: false })
  @Prop({ required: true, unique: true })
  email: string;
}

export const OwnerSchema = SchemaFactory.createForClass(Owner);
