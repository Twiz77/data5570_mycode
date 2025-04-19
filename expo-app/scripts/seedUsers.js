// Script to seed the database with mock users
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

// API URL - Update with your actual IP address
const API_URL = 'http://localhost:8000/api/auth/register/';

// Function to create a user
async function createUser(userData) {
  try {
    // Split the name into first and last name
    const nameParts = userData.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    // Create a unique email based on the name
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@example.com`;
    
    // Create a password (you might want to change this)
    const password = 'Password123!';
    
    // Format the user data for the API
    const formattedUser = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      phone_number: '555-123-4567', // Default phone number
      skill_rating: userData.rating,
      location: userData.location,
      availability: userData.availability,
      preferred_play: userData.preferredPlay,
      experience_years: parseFloat(userData.experience.split(' ')[0]) // Extract the number from "X years"
    };
    
    console.log(`Creating user: ${userData.name}`);
    console.log('Formatted user data:', JSON.stringify(formattedUser, null, 2));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedUser),
    });
    
    const data = await response.json();
    console.log(`Response status: ${response.status}`);
    console.log(`Response data:`, JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error(`Failed to create user ${userData.name}:`, data);
      return false;
    }
    
    console.log(`Successfully created user: ${userData.name}`);
    return true;
  } catch (error) {
    console.error(`Error creating user ${userData.name}:`, error);
    return false;
  }
}

// Function to seed all users
async function seedUsers() {
  console.log('Starting to seed users...');
  let successCount = 0;
  
  for (const user of mockUsers) {
    const success = await createUser(user);
    if (success) successCount++;
    
    // Add a small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`Seeding complete. Successfully created ${successCount} out of ${mockUsers.length} users.`);
}

// Run the seeding function
seedUsers(); 