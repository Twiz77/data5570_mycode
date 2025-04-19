import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider } from 'react-redux';
import { store } from '../redux/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Welcome",
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              title: "Register",
            }}
          />
          <Stack.Screen
            name="login"
            options={{
              title: "Login",
            }}
          />
          <Stack.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
            }}
          />
          <Stack.Screen
            name="displayUserData"
            options={{
              title: "User Data",
            }}
          />
          <Stack.Screen
            name="test"
            options={{
              title: "Test",
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              title: "Profile",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="admin"
            options={{
              title: "Admin",
              headerShown: false,
            }}
          />
        </Stack>
      </PaperProvider>
    </Provider>
  );
}

// This is important for Expo Router to work correctly
export const unstable_settings = {
  initialRouteName: "index",
};
