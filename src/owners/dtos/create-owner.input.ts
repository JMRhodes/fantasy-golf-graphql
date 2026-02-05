import { IsString, IsEmail, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateOwnerInput {
  @Field(() => String)
  @IsString()
  @MinLength(2)
  name: string;

  @Field(() => String)
  @IsEmail()
  email: string;
}
