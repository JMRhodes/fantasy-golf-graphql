import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from 'env.validation';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PlayersModule } from './players/players.module';
import { DrizzlePostgresModule } from '@knaadh/nestjs-drizzle-postgres';
import * as schema from './db/schema';

@Module({
  imports: [
    PlayersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    DrizzlePostgresModule.registerAsync({
      tag: 'DB_DEV',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          postgres: {
            url: configService.get<string>('DATABASE_URL') || '',
          },
          config: { schema },
        };
      },
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
