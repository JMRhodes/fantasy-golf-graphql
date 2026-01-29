import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

@InputType()
export class OwnerInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @Field()
  @IsEmail()
  email: string;
}
