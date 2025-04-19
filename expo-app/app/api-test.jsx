import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Card, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

// Create a custom theme with black text color
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: 'black',
    primary: '#27c2a0',
  },
};

export default function ApiTest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const testEndpoints = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    
    const endpoints = [
      { name: 'Users All', url: 'http://10.0.2.2:8000/api/users/all/' },
      { name: 'Profile', url: 'http://10.0.2.2:8000/api/auth/profile/' },
      { name: 'Players', url: 'http://10.0.2.2:8000/api/players/' },
    ];
    
    const newResults = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint.name}`);
        const response = await fetch(endpoint.url);
        const status = response.status;
        const responseText = await response.text();
        let data = null;
        
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = responseText;
        }
        
        newResults.push({
          name: endpoint.name,
          status,
          data: data,
          success: response.ok
        });
        
        console.log(`Result for ${endpoint.name}:`, { status, data });
      } catch (error) {
        console.error(`Error testing ${endpoint.name}:`, error);
        newResults.push({
          name: endpoint.name,
          error: error.message,
          success: false
        });
      }
    }
    
    setResults(newResults);
    setLoading(false);
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text style={styles.title}>API Connection Test</Text>
        
        <Button 
          mode="contained" 
          onPress={testEndpoints}
          style={styles.button}
          loading={loading}
        >
          Test API Endpoints
        </Button>
        
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content>
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        )}
        
        <ScrollView style={styles.resultsContainer}>
          {results.map((result, index) => (
            <Card key={index} style={[styles.resultCard, !result.success && styles.errorCard]}>
              <Card.Title title={result.name} />
              <Card.Content>
                <Text style={styles.statusText}>Status: {result.status || 'N/A'}</Text>
                {result.error ? (
                  <Text style={styles.errorText}>{result.error}</Text>
                ) : (
                  <Text style={styles.dataText}>
                    {typeof result.data === 'object' 
                      ? JSON.stringify(result.data, null, 2) 
                      : result.data}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
        
        <Button 
          mode="outlined" 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back to Dashboard
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#004b87',
  },
  button: {
    marginBottom: 20,
    backgroundColor: '#27c2a0',
  },
  backButton: {
    marginTop: 20,
    borderColor: '#27c2a0',
  },
  resultsContainer: {
    flex: 1,
  },
  resultCard: {
    marginBottom: 10,
    borderRadius: 8,
  },
  errorCard: {
    borderColor: 'red',
    borderWidth: 1,
  },
  statusText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dataText: {
    fontSize: 12,
  },
  errorText: {
    color: 'red',
  },
}); 