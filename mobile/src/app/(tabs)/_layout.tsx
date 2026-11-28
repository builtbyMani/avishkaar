import { Tabs } from "expo-router";
import React from "react";
import { AppHeader } from "../../components/AppHeader";
import { FloatingTabBar } from "../../components/FloatingTabBar";
import { COLORS } from "../../theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        header: () => <AppHeader />,
        animation: "shift",
        sceneStyle: { backgroundColor: COLORS.parchment },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Explore" }} />
      <Tabs.Screen name="submit" options={{ title: "Post" }} />
      <Tabs.Screen name="offline" options={{ title: "Saved" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
