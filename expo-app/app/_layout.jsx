import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set isReady to true after a short delay to ensure the layout is mounted
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#27c2a0" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#27c2a0" />
        </View>
      } persistor={persistor}>
        <PaperProvider>
          <Slot />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}

// This is important for Expo Router to work correctly
export const unstable_settings = {
  initialRouteName: "index",
};
