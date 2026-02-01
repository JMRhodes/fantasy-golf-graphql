import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from 'env.validation';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { ResultsModule } from '../results/results.module';
import { ListTournamentsCommand } from './tournaments.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    TournamentsModule,
    ResultsModule,
  ],
  providers: [ListTournamentsCommand],
})
export class CliModule {}
