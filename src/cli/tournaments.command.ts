import { Command, CommandRunner } from 'nest-commander';
import { TournamentService } from '../tournaments/tournaments.service';

@Command({
  name: 'list-tournaments',
  description: 'Print all tournaments from MongoDB',
})
export class ListTournamentsCommand extends CommandRunner {
  constructor(private readonly tournamentService: TournamentService) {
    super();
  }

  async run(): Promise<void> {
    const tournaments = await this.tournamentService.getAllTournaments();

    if (tournaments.length === 0) {
      console.log('No tournaments found.');
      return;
    }

    console.log(`\nFound ${tournaments.length} tournament(s):\n`);

    tournaments.forEach((tournament) => {
      console.log('tournament ${index + 1}:');
      console.log(`  ID: ${tournament.id}`);
      console.log(`  Name: ${tournament.name}`);
      console.log('---------------------------\n');
    });
  }
}
