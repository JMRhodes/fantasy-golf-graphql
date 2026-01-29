const fs = require('fs');
const path = require('path');

// Read the teams data
const teamsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../design/teams.json'), 'utf8')
);

// GraphQL mutation
const mutation = `
  mutation CreateTeams($teams: [CreateTeamInput!]!) {
    createTeams(createTeamInputs: $teams) {
      id
      name
      ownerId {
        id
        name
        email
      }
    }
  }
`;

// Prepare the request payload
const payload = {
  query: mutation,
  variables: {
    teams: teamsData
  }
};

// Make the request
fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload)
})
  .then(response => response.json())
  .then(data => {
    if (data.errors) {
      console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2));
      process.exit(1);
    }
    
    console.log(`✅ Successfully created ${data.data.createTeams.length} teams`);
    
    // Count unique owners
    const uniqueOwners = new Set(
      data.data.createTeams.map(team => team.ownerId.email)
    );
    console.log(`✅ With ${uniqueOwners.size} unique owners`);
    
    // Show first few teams as examples
    console.log('\nFirst 5 teams:');
    data.data.createTeams.slice(0, 5).forEach(team => {
      console.log(`  - ${team.name} (Owner: ${team.ownerId.name})`);
    });
  })
  .catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
