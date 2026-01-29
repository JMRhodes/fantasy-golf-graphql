import * as fs from 'fs';
import * as path from 'path';
import * as mongoose from 'mongoose';

interface PGAPlayer {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

interface PlayerDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  pgaId?: number;
  salary: number;
}

interface PGAData {
  players: PGAPlayer[];
}

// Define Mongoose schema for Player
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pgaId: { type: Number, required: false, default: 0 },
  salary: { type: Number, required: true },
}, { timestamps: true });

const Player = mongoose.model<PlayerDocument>('Player', playerSchema);

/**
 * Normalize name for matching (remove extra spaces, convert to lowercase)
 */
function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Main function to update PGA IDs
 */
async function updatePgaIds() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://fantasygolf:fantasygolf@localhost:27017/fantasygolf?authSource=admin';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Read the JSON file
    const jsonPath = path.join(__dirname, '../design/data-api.pgatour.com_player_list_R.json');
    console.log(`Reading PGA player data from ${jsonPath}...`);
    
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const pgaData: PGAData = JSON.parse(rawData);
    
    console.log(`Found ${pgaData.players.length} PGA players in the JSON file`);

    // Create a map of normalized names to PGA IDs
    const pgaPlayerMap = new Map<string, string>();
    pgaData.players.forEach((player) => {
      const normalizedName = normalizeName(player.displayName);
      pgaPlayerMap.set(normalizedName, player.id);
    });

    // Fetch all players from the database
    console.log('\nFetching players from database...');
    const players = await Player.find().exec();
    console.log(`Found ${players.length} players in the database`);

    // Track statistics
    let matched = 0;
    let updated = 0;
    let alreadyHadPgaId = 0;
    let notFound = 0;

    // Process each player
    console.log('\nProcessing players...\n');
    
    for (const player of players) {
      const normalizedName = normalizeName(player.name);
      const pgaId = pgaPlayerMap.get(normalizedName);

      if (pgaId) {
        matched++;
        const pgaIdNumber = parseInt(pgaId, 10);
        
        // Check if player already has this PGA ID
        if (player.pgaId === pgaIdNumber) {
          alreadyHadPgaId++;
          console.log(`✓ ${player.name} already has PGA ID ${pgaId}`);
        } else {
          // Update the player's PGA ID
          try {
            player.pgaId = pgaIdNumber;
            await player.save();
            updated++;
            console.log(`✓ Updated ${player.name} with PGA ID ${pgaId}`);
          } catch (error: any) {
            console.error(`✗ Failed to update ${player.name}:`, error.message);
          }
        }
      } else {
        notFound++;
        console.log(`✗ No PGA ID found for ${player.name}`);
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total players in database: ${players.length}`);
    console.log(`Matched with PGA data: ${matched}`);
    console.log(`Updated: ${updated}`);
    console.log(`Already had correct PGA ID: ${alreadyHadPgaId}`);
    console.log(`Not found in PGA data: ${notFound}`);
    console.log('='.repeat(60));

    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');

  } catch (error) {
    console.error('Error updating PGA IDs:', error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
}

// Run the script
updatePgaIds()
  .then(() => {
    console.log('\n✓ Script completed successfully');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n✗ Script failed:', error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    process.exit(1);
  });
