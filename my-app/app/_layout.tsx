import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/redux/store"; // ✅ Use absolute import
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native"; // ✅ Keep themes for reference but don't use NavigationContainer

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    async function hideSplashScreen() {
      if (loaded) {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn("Error hiding splash screen", error);
        }
      }
    }
    hideSplashScreen();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <Stack />  {/* ✅ Expo Router automatically handles navigation */}
      <StatusBar style="auto" />
    </Provider>
  );
}
