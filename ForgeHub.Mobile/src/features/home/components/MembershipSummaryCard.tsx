import { StyleSheet, Text, View } from "react-native";
import { Membership } from "@/types/membership";
import { ForgeCard } from "@/components/ui/ForgeCard";
import { StatusBadge, toneForStatus } from "@/components/ui/StatusBadge";
import { colors } from "@/theme/colors";

export function MembershipSummaryCard({ membership }: { membership: Membership | null }) {
  return (
    <ForgeCard style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Membership</Text>
          <Text style={styles.title}>{membership?.planName ?? "Not available"}</Text>
        </View>
        <StatusBadge label={membership?.status ?? "Unknown"} tone={toneForStatus(membership?.status)} />
      </View>
      <View style={styles.metrics}>
        <Text style={styles.metric}>{membership?.remainingDays ?? 0} days left</Text>
        <Text style={styles.metric}>{membership?.visitsThisMonth ?? 0} visits this month</Text>
      </View>
    </ForgeCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  label: { color: colors.muted, fontWeight: "800", fontSize: 12 },
  title: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 4, letterSpacing: 0 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { color: colors.text, backgroundColor: colors.surface2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, fontWeight: "800", overflow: "hidden" }
});
