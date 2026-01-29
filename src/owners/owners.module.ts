import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OwnerSchema } from './schemas/owner.schema';
import { OwnerService } from './owners.service';
import { OwnerResolver } from './owners.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Owner', schema: OwnerSchema }]),
  ],
  providers: [OwnerService, OwnerResolver],
  exports: [OwnerService],
})
export class OwnersModule {}
