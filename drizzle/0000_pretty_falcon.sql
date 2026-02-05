CREATE TYPE "public"."status" AS ENUM('UPCOMING', 'IN-PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"pgaId" integer DEFAULT 0,
	"salary" integer DEFAULT 0,
	"avatarUrl" text
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "status" DEFAULT 'UPCOMING' NOT NULL,
	"avatarUrl" text,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "owners_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"ownerId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_players" (
	"teamId" uuid NOT NULL,
	"playerId" uuid NOT NULL,
	CONSTRAINT "team_players_teamId_playerId_pk" PRIMARY KEY("teamId","playerId")
);
--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_ownerId_owners_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_teamId_teams_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;