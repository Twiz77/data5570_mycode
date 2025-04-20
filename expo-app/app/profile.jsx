import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, TextInput, Divider, Provider as PaperProvider, DefaultTheme, Switch, Portal, Dialog, Checkbox, SegmentedButtons } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useSelector, useDispatch } from 'react-redux';
import { logout, fetchUserProfile, updateUserProfile } from '@/state/userSlice';
import { API_URL } from '@/state/userSlice';

// Create a custom theme with black text color
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: 'black',
    primary: '#27c2a0',
  },
};

// Use the API_URL from userSlice.js
const API_BASE_URL = API_URL;

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const profileFetched = useRef(false);
  
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
      first_name: currentUser.first_name || '',
      last_name: currentUser.last_name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      rating: currentUser.rating || 3.0,
      location: currentUser.location || '',
      availability: currentUser.availability || [],
      preferredPlay: currentUser.preferredPlay || 'Both',
      notifications: currentUser.notifications !== undefined ? currentUser.notifications : true,
      emailNotifications: currentUser.emailNotifications !== undefined ? currentUser.emailNotifications : true,
      pushNotifications: currentUser.pushNotifications !== undefined ? currentUser.pushNotifications : true,
    });

    // Fetch latest profile data if we have a token and haven't fetched yet
    if (token && !profileFetched.current) {
      profileFetched.current = true;
      fetchProfile();
    }
  }, [currentUser, token, isAdmin]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile data...');
      const result = await dispatch(fetchUserProfile()).unwrap();
      console.log('Profile data fetched:', result);
      
      // Update profile state with the fetched data
      if (result) {
        setProfile({
          first_name: result.first_name || currentUser.first_name || '',
          last_name: result.last_name || currentUser.last_name || '',
          email: result.email || currentUser.email || '',
          phone: result.phone_number || currentUser.phone || '',
          rating: result.skill_rating || currentUser.rating || 3.0,
          location: result.location || currentUser.location || '',
          availability: result.availability || currentUser.availability || [],
          preferredPlay: result.preferred_play || currentUser.preferredPlay || 'Both',
          notifications: result.notifications_enabled !== undefined ? result.notifications_enabled : (currentUser.notifications || true),
          emailNotifications: result.email_notifications !== undefined ? result.email_notifications : (currentUser.emailNotifications || true),
          pushNotifications: result.push_notifications !== undefined ? result.push_notifications : (currentUser.pushNotifications || true),
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (field, value) => {
    if (field === 'rating') {
      // For rating, we're now using SegmentedButtons which provides a string value
      // We just need to parse it to a float
      value = parseFloat(value);
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
      console.log('Saving profile:', profile);
      
      // Dispatch the updateUserProfile action
      const result = await dispatch(updateUserProfile(profile)).unwrap();
      console.log('Profile saved successfully:', result);
      
      // Show success message
      Alert.alert('Success', 'Your profile has been updated successfully.');
      
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
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
                <Text style={styles.label}>Skill Rating</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={profile.rating.toString()}
                    onValueChange={(value) => handleInputChange('rating', parseFloat(value) || 0)}
                    style={styles.picker}
                  >
                    <Picker.Item label="2.0" value="2.0" />
                    <Picker.Item label="2.5" value="2.5" />
                    <Picker.Item label="3.0" value="3.0" />
                    <Picker.Item label="3.5" value="3.5" />
                    <Picker.Item label="4.0" value="4.0" />
                    <Picker.Item label="4.5" value="4.5" />
                    <Picker.Item label="5.0" value="5.0" />
                  </Picker>
                </View>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: '#fff',
    width: 120,
    alignSelf: 'flex-start',
  },
  picker: {
    height: 50,
    width: 120,
  },
}); 