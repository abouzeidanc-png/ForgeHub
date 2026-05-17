import { StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { ForgeButton } from "@/components/ui/ForgeButton";
import { ForgeCard } from "@/components/ui/ForgeCard";
import { colors } from "@/theme/colors";
import { ActiveCheckIn } from "@/types/checkIn";
import { formatDateTime } from "@/utils/formatDate";

export function CheckInStatusCard({ activeCheckIn }: { activeCheckIn?: ActiveCheckIn | null }) {
  const hasActive = Boolean(activeCheckIn?.hasActiveCheckIn);
  return (
    <ForgeCard style={styles.card}>
      <Text style={styles.title}>{hasActive ? "Checked in" : "Attendance"}</Text>
      {hasActive ? (
        <Text style={styles.text}>
          {activeCheckIn?.branchName ?? "Branch"} since {formatDateTime(activeCheckIn?.checkInTimeUtc)}
          {activeCheckIn?.durationMinutes !== undefined ? ` (${activeCheckIn.durationMinutes} min)` : ""}
        </Text>
      ) : (
        <Text style={styles.text}>Scan the branch QR code when you arrive. Location is used only for attendance validation.</Text>
      )}
      <ForgeButton title="Scan QR" onPress={() => router.push("/qr-scan")} />
      <ForgeButton title="Active check-in" variant="secondary" onPress={() => router.push("/active-checkin")} />
    </ForgeCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  title: { color: colors.text, fontSize: 18, fontWeight: "900", letterSpacing: 0 },
  text: { color: colors.muted, lineHeight: 20, fontWeight: "600" }
});
