import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/theme/colors";

const actions = [
  { label: "Membership", icon: "card-account-details-outline", route: "/membership" },
  { label: "Branches", icon: "map-marker-radius-outline", route: "/branches" },
  { label: "Bookings", icon: "calendar-check-outline", route: "/bookings" },
  { label: "History", icon: "history", route: "/history" }
] as const;

export function QuickActionsGrid() {
  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <Pressable key={action.label} onPress={() => router.push(action.route)} style={styles.item}>
          <MaterialCommunityIcons name={action.icon} color={colors.primary} size={24} />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  item: { width: "48%", minHeight: 86, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", gap: 8 },
  label: { color: colors.text, fontWeight: "800", fontSize: 13, letterSpacing: 0 }
});
