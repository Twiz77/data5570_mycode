import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Provider as PaperProvider, DefaultTheme, Divider, List, Switch } from 'react-native-paper';
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

export default function Admin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  
  // Get current user and all users from Redux store
  const currentUser = useSelector(state => state.user.currentUser);
  const allUsers = useSelector(state => state.user.allUsers);
  const status = useSelector(state => state.user.status);
  
  console.log('Admin component - currentUser:', currentUser);
  console.log('Admin component - allUsers:', allUsers);
  
  // Check if current user is an admin
  const isAdmin = currentUser && currentUser.isAdmin === true;
  
  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        await dispatch(fetchAllUsers()).unwrap();
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAdminData();
  }, [dispatch]);
  
  const handleBack = () => {
    router.replace('/dashboard');
  };
  
  const handleUserAction = (userId, action) => {
    console.log(`Performing ${action} on user ${userId}`);
    // In a real app, this would be an API call
  };
  
  const handleToggleAdmin = (userId, isAdmin) => {
    console.log(`Toggling admin status for user ${userId} to ${isAdmin}`);
    // In a real app, this would be an API call
  };
  
  // If not an admin, redirect to dashboard
  if (!isAdmin) {
    console.log('User is not an admin, redirecting to dashboard');
    router.replace('/dashboard');
    return null;
  }
  
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
          <Text style={styles.title}>Admin Dashboard</Text>
          <View style={{ width: 50 }} />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27c2a0" />
            <Text style={styles.loadingText}>Loading admin data...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <Card style={styles.section}>
              <Card.Content>
                <Text style={styles.sectionTitle}>User Management</Text>
                {allUsers && allUsers.map(user => (
                  <View key={user.id}>
                    <List.Item
                      title={`${user.first_name} ${user.last_name}`}
                      description={`${user.email}\nPhone: ${user.phone_number || 'N/A'}\nRating: ${user.skill_rating || 'N/A'}\nLocation: ${user.location || 'N/A'}`}
                      left={props => <List.Icon {...props} icon="account" />}
                      right={props => (
                        <View style={styles.userActions}>
                          <Switch
                            value={user.isAdmin}
                            onValueChange={(value) => handleToggleAdmin(user.id, value)}
                          />
                          <Button 
                            mode="text" 
                            onPress={() => handleUserAction(user.id, 'suspend')}
                            disabled={user.isAdmin}
                          >
                            Suspend
                          </Button>
                        </View>
                      )}
                    />
                    <Divider />
                  </View>
                ))}
              </Card.Content>
            </Card>
          </ScrollView>
        )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004b87',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27c2a0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
}); 