import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultSchema } from './schemas/result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Result', schema: ResultSchema }]),
  ],
  providers: [ResultsResolver, ResultsService],
})
export class ResultsModule {}
