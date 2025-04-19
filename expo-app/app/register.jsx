import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { Button, Card, Provider as PaperProvider, DefaultTheme, ActivityIndicator } from 'react-native-paper';
import { FormBuilder } from 'react-native-paper-form-builder';
import { useDispatch } from 'react-redux';
import { createUser } from '@/state/userSlice';

// Create a custom theme with black text color
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: 'black',
    primary: '#27c2a0',
  },
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#d0f0ff', // Pickleball-ish background: energetic aqua
    alignItems: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#004b87', // Darker blue for contrast
  },
  card: {
    width: '100%',
    maxWidth: 500,
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#27c2a0',
    borderRadius: 10,
  },
  loginButton: {
    marginTop: 10,
  },
  devButton: {
    marginTop: 20,
    borderColor: '#666',
  },
});

export default function Register() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      username: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    console.log('Starting registration process with data:', data);
    if (data.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // Format phone number to remove any non-numeric characters
    const formattedData = {
      ...data,
      phone_number: data.phone_number.replace(/\D/g, ''),
    };
    console.log('Formatted registration data:', formattedData);

    try {
      console.log('Dispatching createUser action...');
      const result = await dispatch(createUser(formattedData)).unwrap();
      console.log('Registration successful, result:', result);
      
      if (result.id) {
        Alert.alert('Success', 'Registration successful!', [
          {
            text: 'OK',
            onPress: () => router.replace('/dashboard'),
          },
        ]);
      } else {
        throw new Error('Registration failed - no user ID received');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <PaperProvider theme={theme}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>PADDLEUP</Text>
        </View>

        <Card style={styles.card}>
          <Card.Title 
            title="Create Account" 
            titleStyle={{ fontSize: 20, textAlign: 'center' }} 
            titleVariant="headlineMedium"
            style={{ alignItems: 'center' }}
          />
          <Card.Content>
            {isLoading ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <ActivityIndicator size="large" color="#27c2a0" />
                <Text style={{ marginTop: 10 }}>Creating your account...</Text>
              </View>
            ) : (
              <>
                <FormBuilder
                  control={control}
                  setFocus={() => {}}
                  formConfigArray={[
                    {
                      name: 'username',
                      type: 'text',
                      textInputProps: {
                        label: 'Username',
                        mode: 'outlined',
                        style: { backgroundColor: 'white', color: 'black' },
                      },
                      rules: {
                        required: 'Username is required',
                        pattern: {
                          value: /^[a-zA-Z0-9_]{3,20}$/,
                          message: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores',
                        },
                      },
                    },
                    {
                      name: 'first_name',
                      type: 'text',
                      textInputProps: {
                        label: 'First Name',
                        mode: 'outlined',
                        style: { backgroundColor: 'white', color: 'black' },
                      },
                      rules: {
                        required: 'First name is required',
                      },
                    },
                    {
                      name: 'last_name',
                      type: 'text',
                      textInputProps: {
                        label: 'Last Name',
                        mode: 'outlined',
                        style: { backgroundColor: 'white', color: 'black' },
                      },
                      rules: {
                        required: 'Last name is required',
                      },
                    },
                    {
                      name: 'phone_number',
                      type: 'text',
                      textInputProps: {
                        label: 'Phone Number',
                        mode: 'outlined',
                        keyboardType: 'phone-pad',
                        style: { backgroundColor: 'white', color: 'black' },
                      },
                      rules: {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9\-+() ]{7,15}$/,
                          message: 'Invalid phone number',
                        },
                      },
                    },
                    {
                      name: 'email',
                      type: 'text',
                      textInputProps: {
                        label: 'Email',
                        mode: 'outlined',
                        keyboardType: 'email-address',
                        style: { backgroundColor: 'white', color: 'black' },
                      },
                      rules: {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email address',
                        },
                      },
                    },
                    {
                      name: 'password',
                      type: 'text',
                      textInputProps: {
                        label: 'Password',
                        mode: 'outlined',
                        secureTextEntry: true,
                        style: { backgroundColor: 'white', color: 'black' },
                      },
                      rules: {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      },
                    },
                  ]}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  style={styles.submitButton}
                  labelStyle={{ color: '#fff' }}
                >
                  Create Account
                </Button>

                <Button
                  mode="text"
                  onPress={() => router.replace('/login')}
                  style={styles.loginButton}
                  labelStyle={{ color: '#004b87' }}
                >
                  Already have an account? Log in
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => {
                    console.log('Dev registration pressed');
                    router.replace('/dashboard');
                  }}
                  style={styles.devButton}
                  labelStyle={{ color: '#666' }}
                >
                  Skip Registration (Dev Only)
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </PaperProvider>
  );
} 