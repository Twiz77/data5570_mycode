import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Avatar, Divider, Provider as PaperProvider, DefaultTheme, Chip, FAB, IconButton } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchConnections, 
  fetchFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeConnection 
} from '../state/connectionSlice';

// Create a custom theme with black text color
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: 'black',
    primary: '#27c2a0',
  },
};

export default function Connections() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  
  // Get current user and connections from Redux store
  const { currentUser, token } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    token: state.user.token,
  }));
  
  const { connections, friendRequests, loading, error } = useSelector((state) => state.connections);

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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#27c2a0" />
              <Text style={styles.loadingText}>Loading connections...</Text>
            </View>
          ) : (
            <>
              {/* Friend Requests Section */}
              {friendRequests && friendRequests.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Friend Requests</Text>
                  {friendRequests.map(request => (
                    <Card key={request.id} style={styles.card}>
                      <Card.Content style={styles.cardContent}>
                        <Avatar.Text 
                          size={50} 
                          label={`${request.sender_details.first_name[0]}${request.sender_details.last_name[0]}`} 
                          style={styles.avatar}
                        />
                        <View style={styles.userInfo}>
                          <Text style={styles.userName}>
                            {request.sender_details.first_name} {request.sender_details.last_name}
                          </Text>
                          <Text style={styles.userDetail}>
                            Rating: {formatRating(request.sender_details.skill_rating)}
                          </Text>
                          <Text style={styles.userDetail}>
                            Location: {request.sender_details.location_display || 'Not specified'}
                          </Text>
                          <Text style={styles.userDetail}>
                            Available: {Array.isArray(request.sender_details.availability) ? request.sender_details.availability.join(', ') : 'Not specified'}
                          </Text>
                          <Text style={styles.userDetail}>
                            Preferred: {request.sender_details.preferred_play || 'Not specified'}
                          </Text>
                          <Text style={styles.requestDate}>
                            Requested: {formatDate(request.created_at)}
                          </Text>
                        </View>
                      </Card.Content>
                      <Card.Actions style={styles.cardActions}>
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
                      </Card.Actions>
                    </Card>
                  ))}
                </View>
              )}

              {/* Connections Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Connections</Text>
                {connections && connections.length > 0 ? (
                  connections.map(connection => {
                    // Determine which player is the other person (not the current user)
                    const currentPlayerId = currentUser?.player_id;
                    const otherPlayer = connection.player1_details.id === currentPlayerId 
                      ? connection.player2_details 
                      : connection.player1_details;
                    
                    return (
                      <Card key={connection.id} style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                          <Avatar.Text 
                            size={50} 
                            label={`${otherPlayer.first_name[0]}${otherPlayer.last_name[0]}`} 
                            style={styles.avatar}
                          />
                          <View style={styles.userInfo}>
                            <Text style={styles.userName}>
                              {otherPlayer.first_name} {otherPlayer.last_name}
                            </Text>
                            <Text style={styles.userDetail}>
                              Rating: {formatRating(otherPlayer.skill_rating)}
                            </Text>
                            <Text style={styles.userDetail}>
                              Location: {otherPlayer.location_display || 'Not specified'}
                            </Text>
                            <Text style={styles.userDetail}>
                              Phone: {otherPlayer.phone_number || 'Not provided'}
                            </Text>
                            <Text style={styles.userDetail}>
                              Available: {Array.isArray(otherPlayer.availability) ? otherPlayer.availability.join(', ') : 'Not specified'}
                            </Text>
                            <Text style={styles.userDetail}>
                              Preferred: {otherPlayer.preferred_play || 'Not specified'}
                            </Text>
                            <Text style={styles.connectedSince}>
                              Connected since: {formatDate(connection.created_at)}
                            </Text>
                          </View>
                        </Card.Content>
                        <Card.Actions style={styles.cardActions}>
                          {otherPlayer.phone_number && (
                            <Button 
                              mode="contained" 
                              onPress={() => handleCall(otherPlayer.phone_number)}
                              style={styles.callButton}
                              icon="phone"
                            >
                              Call
                            </Button>
                          )}
                          <Button 
                            mode="contained" 
                            onPress={() => console.log(`Message ${otherPlayer.first_name}`)}
                            style={styles.messageButton}
                            icon="message"
                          >
                            Message
                          </Button>
                          <Button 
                            mode="outlined" 
                            onPress={() => handleRemoveConnection(connection.id)}
                            style={styles.removeButton}
                            icon="account-remove"
                          >
                            Remove
                          </Button>
                        </Card.Actions>
                      </Card>
                    );
                  })
                ) : (
                  <Card style={styles.emptyCard}>
                    <Card.Content>
                      <Text style={styles.emptyText}>You don't have any connections yet.</Text>
                      <Text style={styles.emptySubtext}>Connect with other players to start playing together!</Text>
                    </Card.Content>
                  </Card>
                )}
              </View>
            </>
          )}
        </ScrollView>

        <FAB
          icon="account-plus"
          style={styles.fab}
          onPress={() => router.replace('/dashboard')}
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
}); 