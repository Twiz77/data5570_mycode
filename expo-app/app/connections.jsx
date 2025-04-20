import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Avatar, Divider, Provider as PaperProvider, DefaultTheme, Chip, FAB, IconButton, Searchbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { 
  fetchConnections, 
  fetchFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeConnection 
} from '../state/connectionSlice';
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

// Create memoized selectors
const selectUserState = (state) => state.user;
const selectConnectionsState = (state) => state.connections;

const selectUserData = createSelector(
  [selectUserState],
  (userState) => ({
    currentUser: userState.currentUser,
    token: userState.token,
  })
);

const selectConnectionsData = createSelector(
  [selectConnectionsState],
  (connectionsState) => ({
    loading: connectionsState.loading,
    error: connectionsState.error,
  })
);

export default function Connections() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [showFindPlayers, setShowFindPlayers] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  
  // Use memoized selectors
  const { currentUser, token } = useSelector(selectUserData);
  const { loading: connectionsLoading, error } = useSelector(selectConnectionsData);

  useEffect(() => {
    console.log('Connections - Current User:', currentUser);
    console.log('Connections - Token:', token);

    const checkAuth = async () => {
      if (!currentUser || !token) {
        console.log('No current user or token found, redirecting to login');
        setTimeout(() => {
          router.replace('/login');
        }, 0);
        return;
      }

      // Fetch connections and friend requests
      try {
        await dispatch(fetchConnections()).unwrap();
        await dispatch(fetchFriendRequests()).unwrap();
      } catch (error) {
        console.error('Error fetching connections data:', error);
        if (error.includes('unauthorized') || error.includes('token')) {
          setTimeout(() => {
            router.replace('/login');
          }, 0);
        }
      }
    };

    checkAuth();
  }, [dispatch, currentUser, token]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchConnections()).unwrap(),
      dispatch(fetchFriendRequests()).unwrap()
    ])
      .catch(error => {
        console.error('Error refreshing data:', error);
        Alert.alert('Error', 'Failed to refresh data. Please try again.');
      })
      .finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleBack = () => {
    router.replace('/dashboard');
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      console.log('Accepting friend request:', requestId);
      await dispatch(acceptFriendRequest(requestId)).unwrap();
      // After accepting, fetch connections again to get the new connection
      await dispatch(fetchConnections()).unwrap();
      Alert.alert('Success', 'Friend request accepted');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      console.log('Rejecting friend request:', requestId);
      await dispatch(rejectFriendRequest(requestId)).unwrap();
      Alert.alert('Success', 'Friend request rejected');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request. Please try again.');
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      console.log('Removing connection:', connectionId);
      await dispatch(removeConnection(connectionId)).unwrap();
      Alert.alert('Success', 'Connection removed');
    } catch (error) {
      console.error('Error removing connection:', error);
      Alert.alert('Error', 'Failed to remove connection. Please try again.');
    }
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber.replace(/\D/g, '')}`);
    }
  };

  // Format rating to always show decimal point
  const formatRating = (rating) => {
    if (rating === null || rating === undefined) return 'N/A';
    const numRating = Number(rating);
    return !isNaN(numRating) ? numRating.toFixed(1) : 'N/A';
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPlayers(allPlayers);
      return;
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = allPlayers.filter(player => 
      player.first_name.toLowerCase().includes(searchTerm) ||
      player.last_name.toLowerCase().includes(searchTerm) ||
      (player.location && player.location.toLowerCase().includes(searchTerm)) ||
      player.rating.toString().includes(searchTerm)
    );
    setFilteredPlayers(filtered);
  };

  const fetchAllPlayers = async () => {
    try {
      setLoading(true);
      const result = await dispatch(fetchAllUsers()).unwrap();
      setAllPlayers(result);
      setFilteredPlayers(result);
    } catch (error) {
      console.error('Error fetching players:', error);
      Alert.alert('Error', 'Failed to fetch players. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showFindPlayers) {
      fetchAllPlayers();
    }
  }, [showFindPlayers]);

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button 
            mode="text" 
            onPress={handleBack}
            icon="arrow-left"
          >
            Back
          </Button>
          <Text style={styles.title}>Connections</Text>
          <IconButton 
            icon="refresh" 
            size={24} 
            onPress={onRefresh}
            disabled={refreshing}
          />
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#27c2a0']}
            />
          }
        >
          {/* Friend Requests Section */}
          <Card style={styles.section}>
            <Card.Title title="Friend Requests" />
            <Card.Content>
              {friendRequests.length > 0 ? (
                friendRequests.map((request) => (
                  <View key={request.id} style={styles.requestItem}>
                    <Text style={styles.requestText}>
                      {request.sender.first_name} {request.sender.last_name}
                    </Text>
                    <View style={styles.requestActions}>
                      <Button 
                        mode="contained" 
                        onPress={() => handleAcceptRequest(request.id)}
                        style={styles.acceptButton}
                      >
                        Accept
                      </Button>
                      <Button 
                        mode="outlined" 
                        onPress={() => handleRejectRequest(request.id)}
                        style={styles.rejectButton}
                      >
                        Reject
                      </Button>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No pending friend requests</Text>
              )}
            </Card.Content>
          </Card>

          {/* Existing Connections Section */}
          <Card style={styles.section}>
            <Card.Title title="Your Connections" />
            <Card.Content>
              {connections.length > 0 ? (
                connections.map((connection) => (
                  <View key={connection.id} style={styles.connectionItem}>
                    <Text style={styles.connectionText}>
                      {connection.player.first_name} {connection.player.last_name}
                    </Text>
                    <Text style={styles.connectionDetails}>
                      Rating: {connection.player.rating}
                    </Text>
                    <Text style={styles.connectionDetails}>
                      Location: {connection.player.location || 'Not specified'}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No connections yet</Text>
              )}
            </Card.Content>
          </Card>

          {/* Find Players Section */}
          <Card style={styles.section}>
            <Card.Title 
              title="Find Players" 
              right={(props) => (
                <Button 
                  mode="text" 
                  onPress={() => setShowFindPlayers(!showFindPlayers)}
                  icon={showFindPlayers ? "chevron-up" : "chevron-down"}
                >
                  {showFindPlayers ? "Hide" : "Show"}
                </Button>
              )}
            />
            {showFindPlayers && (
              <Card.Content>
                <Searchbar
                  placeholder="Search by name, location, or rating"
                  onChangeText={handleSearch}
                  value={searchQuery}
                  style={styles.searchBar}
                />
                {loading ? (
                  <ActivityIndicator size="large" color="#27c2a0" />
                ) : filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => (
                    <View key={player.id} style={styles.playerItem}>
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerName}>
                          {player.first_name} {player.last_name}
                        </Text>
                        <Text style={styles.playerDetails}>
                          Rating: {player.rating}
                        </Text>
                        <Text style={styles.playerDetails}>
                          Location: {player.location || 'Not specified'}
                        </Text>
                      </View>
                      <Button 
                        mode="contained" 
                        onPress={() => handleSendFriendRequest(player.id)}
                        style={styles.addButton}
                      >
                        Add Friend
                      </Button>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No players found matching your search' : 'No players available'}
                  </Text>
                )}
              </Card.Content>
            )}
          </Card>
        </ScrollView>

        <FAB
          icon="account-plus"
          style={styles.fab}
          onPress={() => setShowFindPlayers(true)}
          label="Find Players"
        />
      </View>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  section: {
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
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
  requestDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  connectedSince: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  acceptButton: {
    backgroundColor: '#27c2a0',
    marginRight: 8,
  },
  rejectButton: {
    borderColor: '#ff6b6b',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  messageButton: {
    backgroundColor: '#27c2a0',
    marginRight: 8,
  },
  removeButton: {
    borderColor: '#ff6b6b',
  },
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#f9f9f9',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#27c2a0',
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playerDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    marginLeft: 16,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  requestText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  connectionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  connectionDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 