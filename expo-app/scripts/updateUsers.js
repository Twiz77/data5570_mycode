// Script to update existing users in the database
const mockUsers = [
  { id: 1, name: 'John Smith', rating: 4.0, location: 'Seattle, WA', availability: 'Weekends', preferredPlay: 'Singles', experience: '5 years' },
  { id: 2, name: 'Sarah Johnson', rating: 3.5, location: 'Portland, OR', availability: 'Evenings', preferredPlay: 'Doubles', experience: '3 years' },
  { id: 3, name: 'Michael Brown', rating: 2.5, location: 'Vancouver, BC', availability: 'Flexible', preferredPlay: 'Both', experience: '1 year' },
  { id: 4, name: 'Emily Davis', rating: 4.5, location: 'San Francisco, CA', availability: 'Weekdays', preferredPlay: 'Singles', experience: '7 years' },
  { id: 5, name: 'David Wilson', rating: 3.0, location: 'Los Angeles, CA', availability: 'Weekends', preferredPlay: 'Doubles', experience: '2 years' },
  { id: 6, name: 'Jessica Martinez', rating: 4.0, location: 'Seattle, WA', availability: 'Weekdays', preferredPlay: 'Both', experience: '4 years' },
  { id: 7, name: 'Robert Taylor', rating: 2.0, location: 'Portland, OR', availability: 'Weekends', preferredPlay: 'Doubles', experience: '6 months' },
  { id: 8, name: 'Amanda Anderson', rating: 3.5, location: 'Vancouver, BC', availability: 'Evenings', preferredPlay: 'Singles', experience: '3 years' },
  { id: 9, name: 'James Thompson', rating: 4.5, location: 'San Francisco, CA', availability: 'Flexible', preferredPlay: 'Both', experience: '6 years' },
  { id: 10, name: 'Lisa Garcia', rating: 2.5, location: 'Los Angeles, CA', availability: 'Weekdays', preferredPlay: 'Doubles', experience: '1 year' },
  { id: 11, name: 'Thomas Lee', rating: 3.0, location: 'Seattle, WA', availability: 'Evenings', preferredPlay: 'Singles', experience: '2 years' },
  { id: 12, name: 'Jennifer White', rating: 4.0, location: 'Portland, OR', availability: 'Weekends', preferredPlay: 'Both', experience: '5 years' },
  { id: 13, name: 'Christopher Moore', rating: 2.0, location: 'Vancouver, BC', availability: 'Weekdays', preferredPlay: 'Doubles', experience: '8 months' },
  { id: 14, name: 'Michelle Clark', rating: 3.5, location: 'San Francisco, CA', availability: 'Weekends', preferredPlay: 'Singles', experience: '3 years' },
  { id: 15, name: 'Daniel Hall', rating: 4.0, location: 'Los Angeles, CA', availability: 'Evenings', preferredPlay: 'Both', experience: '4 years' },
  { id: 16, name: 'Patricia Young', rating: 2.5, location: 'Seattle, WA', availability: 'Flexible', preferredPlay: 'Doubles', experience: '1 year' },
  { id: 17, name: 'Kevin King', rating: 3.0, location: 'Portland, OR', availability: 'Weekdays', preferredPlay: 'Singles', experience: '2 years' },
  { id: 18, name: 'Nancy Wright', rating: 4.5, location: 'Vancouver, BC', availability: 'Weekends', preferredPlay: 'Both', experience: '6 years' },
  { id: 19, name: 'Steven Lopez', rating: 2.0, location: 'San Francisco, CA', availability: 'Evenings', preferredPlay: 'Doubles', experience: '6 months' },
  { id: 20, name: 'Betty Hill', rating: 3.5, location: 'Los Angeles, CA', availability: 'Flexible', preferredPlay: 'Singles', experience: '3 years' },
];

// API URLs - Update with your actual IP address
const BASE_URL = 'http://localhost:8000/api';
const PLAYERS_URL = `${BASE_URL}/players/`;
const REGISTER_URL = `${BASE_URL}/auth/register/`;

// For development, we'll skip authentication
console.log('Running in development mode - skipping authentication');

// Function to create or update a player
async function updatePlayer(userData) {
  try {
    // Split the name into first and last name
    const nameParts = userData.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    // Create a unique email based on the name
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@example.com`;
    
    // Format the player data
    const formattedPlayer = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone_number: '555-123-4567', // Default phone number
      skill_rating: userData.rating,
      location: userData.location,
      availability: userData.availability,
      preferred_play: userData.preferredPlay,
      experience_years: parseFloat(userData.experience.split(' ')[0]), // Extract the number from "X years"
      password: 'Password123!' // Default password for development
    };
    
    console.log(`Processing player: ${userData.name}`);
    console.log('Formatted player data:', JSON.stringify(formattedPlayer, null, 2));
    
    // First, try to find the player by email
    const findResponse = await fetch(`${PLAYERS_URL}?email=${email}`);
    const findData = await findResponse.json();
    
    if (!findResponse.ok) {
      console.error(`Failed to find player ${userData.name}:`, findData);
      return false;
    }
    
    if (!findData.length) {
      // Player doesn't exist, create a new one
      console.log(`Player ${userData.name} not found, creating new player...`);
      
      const createResponse = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedPlayer),
      });
      
      const createData = await createResponse.json();
      console.log(`Create response status: ${createResponse.status}`);
      console.log(`Create response data:`, JSON.stringify(createData, null, 2));
      
      if (!createResponse.ok) {
        console.error(`Failed to create player ${userData.name}:`, createData);
        return false;
      }
      
      console.log(`Successfully created player: ${userData.name}`);
      return true;
    }
    
    // Player exists, update them
    const playerId = findData[0].id;
    console.log(`Found player ID: ${playerId}, updating...`);
    
    const updateResponse = await fetch(`${PLAYERS_URL}${playerId}/`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedPlayer),
    });
    
    const updateData = await updateResponse.json();
    console.log(`Update response status: ${updateResponse.status}`);
    console.log(`Update response data:`, JSON.stringify(updateData, null, 2));
    
    if (!updateResponse.ok) {
      console.error(`Failed to update player ${userData.name}:`, updateData);
      return false;
    }
    
    console.log(`Successfully updated player: ${userData.name}`);
    return true;
  } catch (error) {
    console.error(`Error processing player ${userData.name}:`, error);
    return false;
  }
}

// Function to process all players
async function processPlayers() {
  console.log('Starting to process players...');
  let successCount = 0;
  
  try {
    for (const user of mockUsers) {
      const success = await updatePlayer(user);
      if (success) successCount++;
      
      // Add a small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Processing complete. Successfully processed ${successCount} out of ${mockUsers.length} players.`);
  } catch (error) {
    console.error('Error during processing:', error);
  }
}

// Run the processing function
processPlayers(); 