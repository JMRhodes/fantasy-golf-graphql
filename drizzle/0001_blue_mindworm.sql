CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournamentId" uuid NOT NULL,
	"playerId" uuid NOT NULL,
	"position" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "results_tournamentId_playerId_unique" UNIQUE("tournamentId","playerId")
);
--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_tournamentId_tournaments_id_fk" FOREIGN KEY ("tournamentId") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_playerId_players_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;