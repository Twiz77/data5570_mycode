import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
      <Slot /> {/* Renders routes like (stack)/_layout.tsx */}
      <StatusBar style="auto" />
    </Provider>
  );
}
