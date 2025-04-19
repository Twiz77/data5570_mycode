import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Modal, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Avatar, Divider, FAB, Provider as PaperProvider, DefaultTheme, Chip, Portal, Dialog, Checkbox, RadioButton } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsers } from '@/state/userSlice';

// Create a custom theme with black text color
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: 'black',
    primary: '#27c2a0',
  },
};

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Filter states
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [selectedPreferredPlay, setSelectedPreferredPlay] = useState([]);
  
  // Get current user and users from Redux store
  const { currentUser, token, isAdmin, allUsers, status } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    token: state.user.token,
    isAdmin: state.user.isAdmin,
    allUsers: state.user.allUsers || [],
    status: state.user.status
  }));

  // Filtered users based on selected filters
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    console.log('Dashboard - Current User:', currentUser);
    console.log('Dashboard - Token:', token);
    console.log('Dashboard - Is Admin:', isAdmin);
    console.log('Dashboard - All Users:', allUsers);
    console.log('Dashboard - Status:', status);

    const checkAuth = async () => {
      if (!currentUser || !token) {
        console.log('No current user or token found, redirecting to login');
        setTimeout(() => {
          router.replace('/login');
        }, 0);
        return;
      }

      // Fetch users if we have a token
      try {
        await fetchUsers();
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error.message.includes('unauthorized') || error.message.includes('token')) {
          setTimeout(() => {
            router.replace('/login');
          }, 0);
        }
      }
    };

    checkAuth();
  }, []);

  // Add a new useEffect to update filtered users when allUsers changes
  useEffect(() => {
    console.log('AllUsers updated:', allUsers);
    if (allUsers && allUsers.length > 0) {
      setFilteredUsers(allUsers);
    }
  }, [allUsers]);

  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      const result = await dispatch(fetchAllUsers()).unwrap();
      console.log('Users fetched successfully:', result);
      
      // Update filtered users with the fetched data
      if (result && result.length > 0) {
        setFilteredUsers(result);
      } else {
        console.log('No users found or empty result');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values for filter options from real user data
  const ratingOptions = [...new Set(allUsers.map(user => user.rating))].sort((a, b) => a - b);
  const locationOptions = [...new Set(allUsers.map(user => user.location))];
  const availabilityOptions = [...new Set(allUsers.flatMap(user => user.availability || []))];
  const preferredPlayOptions = [...new Set(allUsers.map(user => user.preferredPlay))];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUsers().finally(() => setRefreshing(false));
  }, []);

  const handleLogout = () => {
    // In a real app, this would dispatch a logout action
    router.replace('/');
  };

  const handleProfilePress = () => {
    console.log('Profile button pressed');
    console.log('Current user in dashboard:', currentUser);
    console.log('Is admin in dashboard:', isAdmin);
    router.replace('/profile');
  };

  const handleAdminPress = () => {
    console.log('Admin button pressed');
    console.log('Current user in dashboard:', currentUser);
    console.log('Is admin in dashboard:', isAdmin);
    router.replace('/admin');
  };

  const handleApiTestPress = () => {
    router.push('/api-test');
  };

  const applyFilters = (usersToFilter, ratings, locations, availability, preferredPlay) => {
    let filtered = [...usersToFilter];
    
    // Apply rating filter
    if (ratings.length > 0) {
      filtered = filtered.filter(user => ratings.includes(user.rating));
    }
    
    // Apply location filter
    if (locations.length > 0) {
      filtered = filtered.filter(user => locations.includes(user.location));
    }
    
    // Apply availability filter
    if (availability.length > 0) {
      filtered = filtered.filter(user => 
        user.availability && user.availability.some(a => availability.includes(a))
      );
    }
    
    // Apply preferred play filter
    if (preferredPlay.length > 0) {
      filtered = filtered.filter(user => preferredPlay.includes(user.preferredPlay));
    }
    
    setFilteredUsers(filtered);
  };

  const handleFilterPress = () => {
    setFilterModalVisible(true);
  };

  const handleApplyFilters = () => {
    applyFilters(allUsers, selectedRatings, selectedLocations, selectedAvailability, selectedPreferredPlay);
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setSelectedRatings([]);
    setSelectedLocations([]);
    setSelectedAvailability([]);
    setSelectedPreferredPlay([]);
    setFilteredUsers(allUsers);
    setFilterModalVisible(false);
  };

  const toggleRating = (rating) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(selectedRatings.filter(r => r !== rating));
    } else {
      setSelectedRatings([...selectedRatings, rating]);
    }
  };

  const toggleLocation = (location) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const toggleAvailability = (availability) => {
    if (selectedAvailability.includes(availability)) {
      setSelectedAvailability(selectedAvailability.filter(a => a !== availability));
    } else {
      setSelectedAvailability([...selectedAvailability, availability]);
    }
  };

  const togglePreferredPlay = (play) => {
    if (selectedPreferredPlay.includes(play)) {
      setSelectedPreferredPlay(selectedPreferredPlay.filter(p => p !== play));
    } else {
      setSelectedPreferredPlay([...selectedPreferredPlay, play]);
    }
  };

  // Format rating to always show decimal point
  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <View style={styles.headerButtons}>
            <Button 
              mode="text" 
              onPress={handleApiTestPress}
              icon="api"
              style={styles.headerButton}
            >
              API Test
            </Button>
            <Button 
              mode="text" 
              onPress={handleProfilePress}
              icon="account"
              style={styles.headerButton}
            >
              Profile
            </Button>
            {isAdmin && (
              <Button 
                mode="text" 
                onPress={handleAdminPress}
                icon="shield-account"
                style={styles.headerButton}
              >
                Admin
              </Button>
            )}
            <Button 
              mode="text" 
              onPress={handleLogout}
              icon="logout"
              style={styles.headerButton}
            >
              Logout
            </Button>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Card style={styles.welcomeCard}>
            <Card.Content>
              <Text style={styles.welcomeText}>
                Welcome{currentUser?.first_name ? `, ${currentUser.first_name}` : ''}!
              </Text>
              <Text style={styles.welcomeSubtext}>
                Find pickleball partners near you
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Players</Text>
            <Button 
              mode="text" 
              onPress={handleFilterPress}
              icon="filter-variant"
            >
              Filter
            </Button>
          </View>

          {/* Active filters display */}
          {(selectedRatings.length > 0 || selectedLocations.length > 0 || selectedAvailability.length > 0 || selectedPreferredPlay.length > 0) && (
            <View style={styles.activeFiltersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedRatings.map(rating => (
                  <Chip 
                    key={`rating-${rating}`} 
                    style={styles.filterChip}
                    onClose={() => toggleRating(rating)}
                  >
                    Rating: {formatRating(rating)}
                  </Chip>
                ))}
                {selectedLocations.map(location => (
                  <Chip 
                    key={`location-${location}`} 
                    style={styles.filterChip}
                    onClose={() => toggleLocation(location)}
                  >
                    Location: {location}
                  </Chip>
                ))}
                {selectedAvailability.map(availability => (
                  <Chip 
                    key={`availability-${availability}`} 
                    style={styles.filterChip}
                    onClose={() => toggleAvailability(availability)}
                  >
                    Available: {availability}
                  </Chip>
                ))}
                {selectedPreferredPlay.map(play => (
                  <Chip 
                    key={`play-${play}`} 
                    style={styles.filterChip}
                    onClose={() => togglePreferredPlay(play)}
                  >
                    Play: {play}
                  </Chip>
                ))}
              </ScrollView>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#27c2a0" />
              <Text style={styles.loadingText}>Loading players...</Text>
            </View>
          ) : (
            filteredUsers.map(user => (
              <Card key={user.id} style={styles.userCard}>
                <Card.Content style={styles.userCardContent}>
                  <Avatar.Text 
                    size={50} 
                    label={user.first_name ? `${user.first_name[0]}${user.last_name?.[0] || ''}` : '??'} 
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
                    <Text style={styles.userDetail}>Rating: {formatRating(user.rating)}</Text>
                    <Text style={styles.userDetail}>Location: {user.location || 'N/A'}</Text>
                    <Text style={styles.userDetail}>Available: {user.availability?.join(', ') || 'N/A'}</Text>
                    <Text style={styles.userDetail}>Preferred: {user.preferredPlay || 'N/A'}</Text>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button 
                    mode="contained" 
                    onPress={() => console.log(`Connect with ${user.first_name} ${user.last_name}`)}
                    style={styles.connectButton}
                  >
                    Connect
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
        </ScrollView>

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => console.log('Create game pressed')}
        />
      </View>

      {/* Filter Modal */}
      <Portal>
        <Dialog visible={filterModalVisible} onDismiss={() => setFilterModalVisible(false)} style={styles.filterDialog}>
          <Dialog.Title>Filter Players</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.filterScrollView}>
              <Text style={styles.filterSectionTitle}>Skill Rating</Text>
              <View style={styles.filterOptions}>
                {ratingOptions.map(rating => (
                  <Checkbox.Item
                    key={`rating-${rating}`}
                    label={`${formatRating(rating)} ${rating >= 4.0 ? '(Advanced)' : rating >= 3.0 ? '(Intermediate)' : '(Beginner)'}`}
                    status={selectedRatings.includes(rating) ? 'checked' : 'unchecked'}
                    onPress={() => toggleRating(rating)}
                  />
                ))}
              </View>

              <Divider style={styles.divider} />

              <Text style={styles.filterSectionTitle}>Location</Text>
              <View style={styles.filterOptions}>
                {locationOptions.map(location => (
                  <Checkbox.Item
                    key={`location-${location}`}
                    label={location}
                    status={selectedLocations.includes(location) ? 'checked' : 'unchecked'}
                    onPress={() => toggleLocation(location)}
                  />
                ))}
              </View>

              <Divider style={styles.divider} />

              <Text style={styles.filterSectionTitle}>Availability</Text>
              <View style={styles.filterOptions}>
                {availabilityOptions.map(availability => (
                  <Checkbox.Item
                    key={`availability-${availability}`}
                    label={availability}
                    status={selectedAvailability.includes(availability) ? 'checked' : 'unchecked'}
                    onPress={() => toggleAvailability(availability)}
                  />
                ))}
              </View>

              <Divider style={styles.divider} />

              <Text style={styles.filterSectionTitle}>Preferred Play</Text>
              <View style={styles.filterOptions}>
                {preferredPlayOptions.map(play => (
                  <Checkbox.Item
                    key={`play-${play}`}
                    label={play}
                    status={selectedPreferredPlay.includes(play) ? 'checked' : 'unchecked'}
                    onPress={() => togglePreferredPlay(play)}
                  />
                ))}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={handleResetFilters}>Reset</Button>
            <Button onPress={handleApplyFilters}>Apply</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004b87',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 10,
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004b87',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  userCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#27c2a0',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  connectButton: {
    backgroundColor: '#27c2a0',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#27c2a0',
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0f2f0',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  filterOptions: {
    marginBottom: 10,
  },
  divider: {
    marginVertical: 10,
  },
  filterDialog: {
    maxHeight: '80%',
  },
  filterScrollView: {
    maxHeight: 400,
  },
}); 