import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, TextInput, Divider, Provider as PaperProvider, DefaultTheme, Switch, Portal, Dialog, Checkbox } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/actions/userActions';

// Create a custom theme with black text color
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: 'black',
    primary: '#27c2a0',
  },
};

const API_BASE_URL = 'http://localhost:8000/api';

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Get current user and token from Redux store
  const { currentUser, token, isAdmin } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    token: state.user.token,
    isAdmin: state.user.isAdmin
  }));
  
  // Profile state
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    rating: 3.0,
    location: '',
    availability: [],
    preferredPlay: 'Both',
    notifications: true,
    emailNotifications: true,
    pushNotifications: true,
  });
  
  // Availability options
  const availabilityOptions = ['Weekdays', 'Weekends', 'Evenings', 'Flexible'];
  
  // Preferred play options
  const preferredPlayOptions = ['Singles', 'Doubles', 'Both'];
  
  useEffect(() => {
    console.log('Profile - Current User:', currentUser);
    console.log('Profile - Token:', token);
    console.log('Profile - Is Admin:', isAdmin);

    if (!currentUser) {
      console.log('No current user found, redirecting to login');
      setTimeout(() => {
        router.replace('/login');
      }, 100);
      return;
    }

    // Initialize profile with current user data
    setProfile({
      name: currentUser.username || '',
      email: currentUser.email || '',
      skillLevel: 'Beginner',
      preferredPlayTime: 'Evening',
      preferredDays: ['Monday', 'Wednesday', 'Friday'],
      location: 'Downtown',
      profilePicture: null
    });

    // Fetch latest profile data if we have a token
    if (token) {
      fetchProfile();
    }
  }, [currentUser, token, isAdmin]);
  
  const handleInputChange = (field, value) => {
    if (field === 'rating') {
      // Ensure value is a string
      const stringValue = String(value);
      
      // Remove any non-numeric characters except the decimal point
      const numericValue = stringValue.replace(/[^0-9.]/g, '');
      
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      } else {
        value = numericValue;
      }
      
      // Limit to one digit before and one digit after the decimal point
      const [integerPart, decimalPart] = value.split('.');
      if (integerPart && integerPart.length > 1) {
        value = integerPart.slice(0, 1) + (decimalPart ? '.' + decimalPart : '');
      }
      if (decimalPart && decimalPart.length > 1) {
        value = integerPart + '.' + decimalPart.slice(0, 1);
      }
    }
    
    setProfile({
      ...profile,
      [field]: value,
    });
  };
  
  const toggleAvailability = (option) => {
    const updatedAvailability = profile.availability.includes(option)
      ? profile.availability.filter(item => item !== option)
      : [...profile.availability, option];
    
    setProfile({
      ...profile,
      availability: updatedAvailability,
    });
  };
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful save
      console.log('Profile saved:', profile);
      
      // In a real app, this would dispatch an action to update the Redux store
      // dispatch(updateUserProfile(profile));
      
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleBack = () => {
    router.replace('/dashboard');
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
          <Text style={styles.title}>Profile</Text>
          <Button 
            mode="contained" 
            onPress={() => setShowSaveDialog(true)}
            disabled={saving}
            loading={saving}
          >
            Save
          </Button>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27c2a0" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView}>
            <Card style={styles.section}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <TextInput
                  label="First Name"
                  value={profile.first_name}
                  onChangeText={(text) => handleInputChange('first_name', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Last Name"
                  value={profile.last_name}
                  onChangeText={(text) => handleInputChange('last_name', text)}
                  style={styles.input}
                />
                <TextInput
                  label="Email"
                  value={profile.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  style={styles.input}
                />
                <TextInput
                  label="Phone"
                  value={profile.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </Card.Content>
            </Card>
            
            <Card style={styles.section}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Pickleball Preferences</Text>
                <TextInput
                  label="Skill Rating"
                  value={profile.rating.toString()}
                  onChangeText={(text) => handleInputChange('rating', parseFloat(text) || 0)}
                  keyboardType="numbers-and-punctuation"
                  style={styles.input}
                />
                <TextInput
                  label="Location"
                  value={profile.location}
                  onChangeText={(text) => handleInputChange('location', text)}
                  style={styles.input}
                />
                
                <Text style={styles.subsectionTitle}>Availability</Text>
                <View style={styles.checkboxGroup}>
                  {availabilityOptions.map(option => (
                    <Checkbox.Item
                      key={option}
                      label={option}
                      status={profile.availability.includes(option) ? 'checked' : 'unchecked'}
                      onPress={() => toggleAvailability(option)}
                    />
                  ))}
                </View>
                
                <Text style={styles.subsectionTitle}>Preferred Play</Text>
                <View style={styles.radioGroup}>
                  {preferredPlayOptions.map(option => (
                    <Checkbox.Item
                      key={option}
                      label={option}
                      status={profile.preferredPlay === option ? 'checked' : 'unchecked'}
                      onPress={() => handleInputChange('preferredPlay', option)}
                    />
                  ))}
                </View>
              </Card.Content>
            </Card>
            
            <Card style={styles.section}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Notification Settings</Text>
                <View style={styles.switchRow}>
                  <Text>Enable Notifications</Text>
                  <Switch
                    value={profile.notifications}
                    onValueChange={(value) => handleInputChange('notifications', value)}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text>Email Notifications</Text>
                  <Switch
                    value={profile.emailNotifications}
                    onValueChange={(value) => handleInputChange('emailNotifications', value)}
                    disabled={!profile.notifications}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text>Push Notifications</Text>
                  <Switch
                    value={profile.pushNotifications}
                    onValueChange={(value) => handleInputChange('pushNotifications', value)}
                    disabled={!profile.notifications}
                  />
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        )}
        
        {/* Save Confirmation Dialog */}
        <Portal>
          <Dialog visible={showSaveDialog} onDismiss={() => setShowSaveDialog(false)}>
            <Dialog.Title>Save Changes</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to save your profile changes?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button onPress={handleSave} loading={saving}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  checkboxGroup: {
    marginBottom: 16,
  },
  radioGroup: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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