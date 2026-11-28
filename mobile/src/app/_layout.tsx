import { ArchivoBlack_400Regular } from "@expo-google-fonts/archivo-black";
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from "@expo-google-fonts/instrument-serif";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider, useApp } from "../components/AppProvider";
import { LandingScreen } from "../components/LandingScreen";
import { Preloader } from "../components/Preloader";
import { COLORS } from "../theme/tokens";

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const pathname = usePathname();
  const { enteredHome, enterHome, preloaderDone, markPreloaderDone } = useApp();
  const isDeepRoute = Boolean(pathname && pathname !== "/" && pathname !== "/(tabs)");
  const showLanding = !enteredHome && !isDeepRoute;

  useEffect(() => {
    if (isDeepRoute && !enteredHome) {
      enterHome();
    }
  }, [enterHome, enteredHome, isDeepRoute]);

  return (
    <View style={styles.root}>
      <StatusBar style={!preloaderDone ? "light" : "dark"} />

      {/* Keep Stack mounted behind LandingScreen so the 58-place feed preloads silently during Preloader + Hero */}
      <View
        style={styles.root}
        pointerEvents={showLanding ? "none" : "auto"}
        importantForAccessibility={showLanding ? "no-hide-descendants" : "auto"}
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.parchment },
            animation: "default",
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="place/[id]"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="about"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="contact"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
        </Stack>
      </View>

      <LandingScreen visible={showLanding} />
      <Preloader visible={!preloaderDone} onDone={markPreloaderDone} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "RozhaOne-Regular": require("../../assets/fonts/RozhaOne-Regular.ttf"),
    "Modak-Regular": require("../../assets/fonts/Modak-Regular.ttf"),
    "InstrumentSerif-Regular": InstrumentSerif_400Regular,
    "InstrumentSerif-Italic": InstrumentSerif_400Regular_Italic,
    "ArchivoBlack-Regular": ArchivoBlack_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <View style={[styles.root, { backgroundColor: COLORS.ink }]} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.parchment,
  },
});
