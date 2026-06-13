import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForgeTheme } from "@/theme/theme";

const activeColor = "#FC6A0A";
const inactiveColor = "#A5A5AE";
const tabBarColor = "#151515";
const qrBorderColor = "#E74504";

const iconMap = {
  home: "home-variant-outline",
  bookings: "calendar-check-outline",
  "check-in": "qrcode-scan",
  payments: "credit-card-outline",
  profile: "account-circle-outline"
} as const;

export function ForgeBottomTabs() {
  const theme = useForgeTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  const barHeight = 90 + bottomInset;
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.tabItem,
        tabBarBackground: () => <BottomNavShape height={barHeight} bottomInset={bottomInset} />,
        tabBarStyle: {
          position: "absolute",
          height: barHeight,
          paddingTop: 12,
          paddingBottom: bottomInset + 9,
          paddingHorizontal: 8,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          overflow: "visible",
          shadowColor: "#000000",
          shadowOpacity: 0,
          elevation: 0
        },
        tabBarIcon: ({ color, focused }) => {
          const key = route.name as keyof typeof iconMap;
          if (key === "check-in") {
            return (
              <View style={styles.fabWrap}>
                <View style={styles.fab}>
                  <MaterialCommunityIcons name={iconMap[key]} size={32} color="#FFFFFF" />
                </View>
                {focused ? <View style={[styles.dot, { backgroundColor: theme.primary, shadowColor: theme.primary }]} /> : null}
              </View>
            );
          }
          return <MaterialCommunityIcons name={iconMap[key]} size={27} color={color} />;
        }
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="bookings" options={{ title: "Booking" }} />
      <Tabs.Screen name="check-in" options={{ title: "Check In", tabBarLabel: () => null }} />
      <Tabs.Screen name="payments" options={{ title: "Payment" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="classes" options={{ href: null }} />
      <Tabs.Screen name="insights" options={{ href: null }} />
    </Tabs>
  );
}

function BottomNavShape({ height, bottomInset }: { height: number; bottomInset: number }) {
  return (
    <View pointerEvents="none" style={[styles.shapeWrap, { height }]}>
      <View style={[styles.barPanel, { height, paddingBottom: bottomInset }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 2,
    justifyContent: "center"
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 0
  },
  shapeWrap: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 0,
    overflow: "visible"
  },
  barPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tabBarColor,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderTopWidth: 1,
    borderTopColor: "rgba(252,106,10,0.18)",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
    overflow: "visible"
  },
  fabWrap: { alignItems: "center", justifyContent: "center", marginTop: -42 },
  fab: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: activeColor,
    borderWidth: 3,
    borderColor: qrBorderColor,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: activeColor,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10
  },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4, shadowOpacity: 0.35, shadowRadius: 5 }
});
