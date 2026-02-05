import { Module } from '@nestjs/common';
import { OwnersResolver } from './owners.resolver';
import { OwnersService } from './owners.service';

@Module({
  imports: [],
  providers: [OwnersResolver, OwnersService],
  exports: [OwnersService],
})
export class OwnersModule {}
