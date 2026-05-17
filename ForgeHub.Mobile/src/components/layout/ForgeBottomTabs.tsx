import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { FloatingQrButton } from "./FloatingQrButton";

const iconMap = {
  home: "home-variant-outline",
  classes: "calendar-star",
  insights: "chart-box-outline",
  profile: "account-circle-outline"
} as const;

export function ForgeBottomTabs() {
  return (
    <>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            position: "absolute",
            height: 76,
            paddingTop: 8,
            paddingBottom: 12,
            backgroundColor: colors.surface,
            borderTopColor: colors.border
          },
          tabBarIcon: ({ color, size }) => {
            const key = route.name as keyof typeof iconMap;
            return <MaterialCommunityIcons name={iconMap[key]} size={size} color={color} />;
          }
        })}
      >
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="classes" options={{ title: "Classes" }} />
        <Tabs.Screen name="insights" options={{ title: "Insights" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
      <FloatingQrButton />
    </>
  );
}
