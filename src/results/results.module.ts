import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultSchema } from './schemas/result.schema';
import { ResultResolver } from './results.resolver';
import { ResultService } from './results.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Result', schema: ResultSchema }]),
  ],
  exports: [ResultService],
  providers: [ResultResolver, ResultService],
})
export class ResultsModule {}
