import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from 'env.validation';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PlayersModule } from './players/players.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentsModule } from './tournaments/tournaments.module';
import { ResultsModule } from './results/results.module';
import { OwnersModule } from './owners/owners.module';
import { TeamsModule } from './teams/teams.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    OwnersModule,
    PlayersModule,
    ResultsModule,
    TeamsModule,
    TournamentsModule,
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
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend', 'dist'),
      exclude: ['graphql', '/graphql/', '/graphql/*'],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      graphiql: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
