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
  removeConnection,
  sendFriendRequest
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
  const [isRemovingConnection, setIsRemovingConnection] = useState(false);
  
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
        console.log('Fetching connections and friend requests...');
        const connectionsResult = await dispatch(fetchConnections()).unwrap();
        console.log('Connections fetched:', connectionsResult);
        setConnections(connectionsResult);
        
        const friendRequestsResult = await dispatch(fetchFriendRequests()).unwrap();
        console.log('Friend requests fetched:', friendRequestsResult);
        
        // Update local state with the fetched data
        if (friendRequestsResult) {
          setFriendRequests(friendRequestsResult);
        }
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
      .then(([connectionsResult, friendRequestsResult]) => {
        setConnections(connectionsResult);
        if (friendRequestsResult) {
          setFriendRequests(friendRequestsResult);
        }
      })
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
      console.log('Current friend requests:', friendRequests);
      
      await dispatch(acceptFriendRequest(requestId)).unwrap();
      
      console.log('Friend request accepted successfully');
      
      // Refresh connections and friend requests
      const [connectionsResult, friendRequestsResult] = await Promise.all([
        dispatch(fetchConnections()).unwrap(),
        dispatch(fetchFriendRequests()).unwrap()
      ]);
      
      setConnections(connectionsResult);
      if (friendRequestsResult) {
        setFriendRequests(friendRequestsResult);
      }
      
      console.log('Updated connections:', connectionsResult);
      console.log('Updated friend requests:', friendRequestsResult);
      
      Alert.alert('Success', 'Friend request accepted');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        requestId
      });
      
      // Check for specific error types
      if (error.message && error.message.includes('already connected')) {
        Alert.alert('Error', 'You are already connected with this user');
      } else {
        Alert.alert('Error', 'Failed to accept friend request');
      }
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      console.log('Rejecting friend request:', requestId);
      await dispatch(rejectFriendRequest(requestId)).unwrap();
      // Refresh the friend requests list after rejecting
      const updatedRequests = await dispatch(fetchFriendRequests()).unwrap();
      // Update local state with the fetched data
      if (updatedRequests) {
        setFriendRequests(updatedRequests);
      }
      Alert.alert('Success', 'Friend request rejected');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request. Please try again.');
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      console.log('Removing connection:', connectionId);
      
      // Show confirmation dialog
      Alert.alert(
        'Remove Connection',
        'Are you sure you want to remove this connection?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              setIsRemovingConnection(true);
              try {
                // Use the removeConnection thunk
                await dispatch(removeConnection(connectionId)).unwrap();
                
                // Refresh connections list
                await dispatch(fetchConnections()).unwrap();
                
                Alert.alert('Success', 'Connection removed');
              } finally {
                setIsRemovingConnection(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error removing connection:', error);
      Alert.alert('Error', 'Failed to remove connection');
      setIsRemovingConnection(false);
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

  const handleSendFriendRequest = async (playerId) => {
    try {
      if (!playerId) {
        console.error('No player ID provided');
        Alert.alert('Error', 'Unable to send friend request: Invalid player data');
        return;
      }

      console.log('Sending friend request to player ID:', playerId);
      const result = await dispatch(sendFriendRequest(playerId)).unwrap();
      console.log('Friend request sent successfully:', result);
      
      Alert.alert('Success', 'Friend request sent successfully!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', error.message || 'Failed to send friend request');
    }
  };

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
                friendRequests
                  .filter(request => request.sender.id !== request.receiver.id) // Filter out self-friend requests
                  .map((request) => (
                  <View key={request.id} style={styles.requestItem}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>
                        {request.sender_details.first_name} {request.sender_details.last_name}
                      </Text>
                      <Text style={styles.requestDetails}>
                        Rating: {request.sender_details.skill_rating || 'Not specified'}
                      </Text>
                      <Text style={styles.requestDetails}>
                        Location: {request.sender_details.location_display || 'Not specified'}
                      </Text>
                      <Text style={styles.requestDetails}>
                        Skill Level: {request.sender_details.skill_level || 'Not specified'}
                      </Text>
                    </View>
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
                connections.map((connection) => {
                  // Determine which player is the current user and which is the other player
                  const currentPlayerId = currentUser?.player_id;
                  const isCurrentUserPlayer1 = connection.player1 === currentPlayerId;
                  const connectedPlayer = isCurrentUserPlayer1 ? connection.player2_details : connection.player1_details;
                  
                  return (
                    <View key={connection.id} style={styles.connectionItem}>
                      <View style={styles.connectionInfo}>
                        <Text style={styles.connectionName}>
                          {connectedPlayer.first_name} {connectedPlayer.last_name}
                        </Text>
                        <View style={styles.connectionDetailsContainer}>
                          <View style={styles.connectionDetail}>
                            <Text style={styles.connectionDetailLabel}>Rating:</Text>
                            <Text style={styles.connectionDetailValue}>
                              {formatRating(connectedPlayer.skill_rating)}
                            </Text>
                          </View>
                          <View style={styles.connectionDetail}>
                            <Text style={styles.connectionDetailLabel}>Location:</Text>
                            <Text style={styles.connectionDetailValue}>
                              {connectedPlayer.location_display || 'Not specified'}
                            </Text>
                          </View>
                          <View style={styles.connectionDetail}>
                            <Text style={styles.connectionDetailLabel}>Phone:</Text>
                            <Text 
                              style={[styles.connectionDetailValue, styles.phoneNumber]}
                              onPress={() => handleCall(connectedPlayer.phone_number)}
                            >
                              {connectedPlayer.phone_number || 'Not specified'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Button
                        title={isRemovingConnection ? "Removing..." : "Remove"} 
                        onPress={() => handleRemoveConnection(connection.id)}
                        disabled={isRemovingConnection}
                        color="#ff4444"
                      />
                    </View>
                  );
                })
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
                        onPress={() => handleSendFriendRequest(player.player_id || player.id)}
                        style={styles.connectButton}
                      >
                        Connect
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
  connectButton: {
    marginLeft: 16,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  requestDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  connectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  connectionInfo: {
    flex: 1,
    marginRight: 16,
  },
  connectionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  connectionDetailsContainer: {
    gap: 8,
  },
  connectionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDetailLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  connectionDetailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  phoneNumber: {
    color: '#27c2a0',
    textDecorationLine: 'underline',
  },
}); 