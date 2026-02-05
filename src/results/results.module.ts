import { Module } from '@nestjs/common';
import { ResultsResolver } from './results.resolver';
import { ResultsService } from './results.service';

@Module({
  imports: [],
  providers: [ResultsResolver, ResultsService],
  exports: [ResultsService],
})
export class ResultsModule {}
