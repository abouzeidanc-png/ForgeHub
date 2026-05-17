import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { getHomeDashboard } from "@/api/homeApi";
import { ForgeScreen } from "@/components/layout/ForgeScreen";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { colors } from "@/theme/colors";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TimerPanel } from "@/features/timer/TimerScreen";
import { MembershipSummaryCard } from "./components/MembershipSummaryCard";
import { CheckInStatusCard } from "./components/CheckInStatusCard";
import { QuickActionsGrid } from "./components/QuickActionsGrid";
import { TodayClassesPreview } from "./components/TodayClassesPreview";

export function HomeScreen() {
  const [timerOpen, setTimerOpen] = useState(false);
  const query = useQuery({ queryKey: ["home"], queryFn: getHomeDashboard });
  const data = query.data;
  return (
    <ForgeScreen title={data?.user?.fullName ? `Hi, ${data.user.fullName.split(" ")[0]}` : "Home"} subtitle="Your member dashboard" refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      {query.isLoading ? <LoadingState /> : null}
      {query.error ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : null}
      {data?.warnings.length ? <Text style={styles.warning}>Some dashboard sections could not load: {data.warnings.join(", ")}</Text> : null}
      <View style={styles.metrics}>
        <MetricCard label="Visits" value={data?.membership?.visitsThisMonth ?? data?.stats.totalCheckIns ?? 0} accent />
        <MetricCard label="Days left" value={data?.membership?.remainingDays ?? data?.user?.remainingDays ?? 0} />
      </View>
      <MetricCard label="Workout frequency" value={(data?.stats.workoutFrequency ?? 0) + "/week"} />
      <MembershipSummaryCard membership={data?.membership ?? null} />
      <CheckInStatusCard activeCheckIn={data?.activeCheckIn ?? null} />
      <SectionTitle title="Quick actions" />
      <QuickActionsGrid />
      <Pressable onPress={() => setTimerOpen((current) => !current)} style={({ pressed }) => [styles.timerToggle, pressed && styles.pressed]}>
        <View style={styles.timerToggleLeft}>
          <MaterialCommunityIcons name="timer-outline" color={colors.primary} size={24} />
          <Text style={styles.timerToggleText}>Timer</Text>
        </View>
        <MaterialCommunityIcons name={timerOpen ? "chevron-up" : "chevron-down"} color={colors.muted} size={24} />
      </Pressable>
      {timerOpen ? <TimerPanel /> : null}
      <SectionTitle title="Upcoming classes" />
      <TodayClassesPreview bookings={data?.bookings ?? []} />
    </ForgeScreen>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: "row", gap: 12 },
  warning: { color: colors.warning, backgroundColor: "rgba(245,158,11,0.12)", padding: 12, borderRadius: 14, fontWeight: "800", lineHeight: 19 },
  timerToggle: { minHeight: 62, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timerToggleLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  timerToggleText: { color: colors.text, fontSize: 15, fontWeight: "900", letterSpacing: 0 },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.9 }
});
