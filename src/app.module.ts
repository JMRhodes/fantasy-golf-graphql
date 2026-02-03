import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from 'env.validation';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PlayersModule } from './players/players.module';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { TournamentsModule } from './tournaments/tournaments.module';
import { ResultsModule } from './results/results.module';
import { OwnersModule } from './owners/owners.module';
import { TeamsModule } from './teams/teams.module';
import { Owner, OwnerSchema } from './owners/schemas/owner.schema';
import { Model } from 'mongoose';
import { TeamSchema, Team } from './teams/schemas/team.schema';
import { PlayerSchema, Player } from './players/schemas/player.schema';

// const DEFAULT_ADMIN = {
//   email: 'admin@example.com',
//   password: 'password',
// };

// const authenticate = async (email: string, password: string) => {
//   if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
//     return Promise.resolve(DEFAULT_ADMIN);
//   }
//   return null;
// };

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
    Promise.all([
      import('adminjs'),
      import('@adminjs/mongoose'),
      import('@adminjs/nestjs'),
    ]).then(([AdminJSModule, AdminJSMongoose, AdminJSNestJS]) => {
      const AdminJS = AdminJSModule.default;
      AdminJS.registerAdapter({
        Resource: AdminJSMongoose.Resource,
        Database: AdminJSMongoose.Database,
      });

      return AdminJSNestJS.AdminModule.createAdminAsync({
        imports: [
          MongooseModule.forFeature([
            { name: 'Player', schema: PlayerSchema },
            { name: 'Team', schema: TeamSchema },
            { name: 'Owner', schema: OwnerSchema },
          ]),
        ],
        inject: [
          getModelToken(Owner.name),
          getModelToken(Team.name),
          getModelToken(Player.name),
        ],
        useFactory: (
          ownerModel: Model<Owner>,
          teamModel: Model<Team>,
          playerModel: Model<Player>,
        ) => ({
          adminJsOptions: {
            rootPath: '/admin',
            resources: [
              playerModel,
              ownerModel,
            ],
          },
          // auth: {
          //   authenticate,
          //   cookieName: 'adminjs',
          //   cookiePassword: 'secret',
          // },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret',
          },
        }),
      });
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
