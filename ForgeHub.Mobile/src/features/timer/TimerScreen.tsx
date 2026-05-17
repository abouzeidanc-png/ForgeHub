import { useEffect, useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ForgeScreen } from "@/components/layout/ForgeScreen";
import { ForgeButton } from "@/components/ui/ForgeButton";
import { ForgeCard } from "@/components/ui/ForgeCard";
import { colors } from "@/theme/colors";
import { useWorkoutTimerStore } from "./useWorkoutTimerStore";

const quickDurations = [
  { label: "30 sec", seconds: 30 },
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 }
] as const;

function formatClock(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function formatElapsed(milliseconds: number) {
  const safeMilliseconds = Math.max(0, Math.floor(milliseconds));
  const totalSeconds = Math.floor(safeMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((safeMilliseconds % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function formatCountdown(milliseconds: number) {
  const safeMilliseconds = Math.max(0, Math.ceil(milliseconds / 1000) * 1000);
  const totalSeconds = Math.floor(safeMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TimerScreen() {
  return (
    <ForgeScreen title="Timer" subtitle="Clock, laps, and countdown">
      <TimerPanel />
    </ForgeScreen>
  );
}

export function TimerPanel() {
  const [now, setNow] = useState(() => Date.now());
  const [customMinutes, setCustomMinutes] = useState("1");
  const mode = useWorkoutTimerStore((state) => state.mode);
  const isRunning = useWorkoutTimerStore((state) => state.isRunning);
  const countdownDurationMs = useWorkoutTimerStore((state) => state.countdownDurationMs);
  const laps = useWorkoutTimerStore((state) => state.laps);
  const completed = useWorkoutTimerStore((state) => state.completed);
  const startTimer = useWorkoutTimerStore((state) => state.startTimer);
  const pauseTimer = useWorkoutTimerStore((state) => state.pauseTimer);
  const resumeTimer = useWorkoutTimerStore((state) => state.resumeTimer);
  const resetTimer = useWorkoutTimerStore((state) => state.resetTimer);
  const addLap = useWorkoutTimerStore((state) => state.addLap);
  const switchMode = useWorkoutTimerStore((state) => state.switchMode);
  const setCountdownDuration = useWorkoutTimerStore((state) => state.setCountdownDuration);
  const getElapsedMs = useWorkoutTimerStore((state) => state.getElapsedMs);
  const getRemainingMs = useWorkoutTimerStore((state) => state.getRemainingMs);
  const syncCountdownCompletion = useWorkoutTimerStore((state) => state.syncCountdownCompletion);

  useEffect(() => {
    const clockInterval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const timerInterval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timerInterval);
  }, [isRunning]);

  const currentStopwatchElapsed = getElapsedMs();
  const currentCountdownRemaining = getRemainingMs();

  useEffect(() => {
    if (mode !== "countdown" || !isRunning || currentCountdownRemaining > 0) {
      return;
    }

    syncCountdownCompletion();
  }, [currentCountdownRemaining, isRunning, mode, syncCountdownCompletion]);

  const clockDate = useMemo(() => new Date(now), [now]);
  const dateLabel = useMemo(() => clockDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }), [clockDate]);

  const startStopwatch = () => {
    if (isRunning && mode === "laps") {
      pauseTimer();
      return;
    }

    if (mode === "laps" && currentStopwatchElapsed > 0) {
      resumeTimer();
      return;
    }

    startTimer("laps");
  };

  const selectDuration = (seconds: number) => {
    setCountdownDuration(seconds * 1000);
    setCustomMinutes(String(seconds / 60));
  };

  const applyCustomDuration = () => {
    const parsedMinutes = Number(customMinutes);
    if (!Number.isFinite(parsedMinutes) || parsedMinutes <= 0) {
      return;
    }

    setCountdownDuration(Math.round(parsedMinutes * 60 * 1000));
  };

  const startCountdown = () => {
    if (isRunning && mode === "countdown") {
      pauseTimer();
      return;
    }

    if (mode === "countdown" && currentCountdownRemaining > 0 && currentCountdownRemaining < countdownDurationMs) {
      resumeTimer();
      return;
    }

    startTimer("countdown", { countdownDurationMs });
  };

  return (
    <>
      <ForgeCard style={styles.clockCard}>
        <View style={styles.panelHeader}>
          <MaterialCommunityIcons name="timer-outline" color={colors.primary} size={22} />
          <Text style={styles.panelTitle}>Timer</Text>
        </View>
        <Text style={styles.clock}>{formatClock(clockDate)}</Text>
        <Text style={styles.date}>{dateLabel}</Text>
      </ForgeCard>

      <View style={styles.switch}>
        <ModeButton label="Laps" active={mode === "laps"} onPress={() => switchMode("laps")} />
        <ModeButton label="Countdown" active={mode === "countdown"} onPress={() => switchMode("countdown")} />
      </View>

      {mode === "laps" ? (
        <ForgeCard style={styles.card}>
          <Text style={styles.sectionTitle}>Stopwatch</Text>
          <Text style={styles.timerValue}>{formatElapsed(currentStopwatchElapsed)}</Text>
          <View style={styles.buttonRow}>
            <ForgeButton title={isRunning ? "Pause" : "Start"} onPress={startStopwatch} style={styles.actionButton} />
            <ForgeButton title="Reset" variant="secondary" onPress={resetTimer} style={styles.actionButton} />
          </View>
          <ForgeButton title="Lap" variant="secondary" onPress={addLap} disabled={!isRunning} />
          <View style={styles.lapList}>
            <Text style={styles.listTitle}>Laps</Text>
            {laps.length === 0 ? <Text style={styles.mutedText}>No laps recorded.</Text> : null}
            {laps.map((lap, index) => (
              <View key={`${lap}-${index}`} style={styles.lapRow}>
                <Text style={styles.lapLabel}>Lap {laps.length - index}</Text>
                <Text style={styles.lapTime}>{formatElapsed(lap)}</Text>
              </View>
            ))}
          </View>
        </ForgeCard>
      ) : (
        <ForgeCard style={styles.card}>
          <Text style={styles.sectionTitle}>Countdown</Text>
          <Text style={styles.timerValue}>{formatCountdown(currentCountdownRemaining)}</Text>
          {completed ? <Text style={styles.finished}>Time finished</Text> : null}
          <View style={styles.quickGrid}>
            {quickDurations.map((duration) => (
              <Pressable
                key={duration.label}
                onPress={() => selectDuration(duration.seconds)}
                style={({ pressed }) => [
                  styles.quickButton,
                  countdownDurationMs === duration.seconds * 1000 && styles.quickButtonActive,
                  pressed && styles.pressed
                ]}
              >
                <Text style={[styles.quickText, countdownDurationMs === duration.seconds * 1000 && styles.quickTextActive]}>{duration.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.customRow}>
            <TextInput
              value={customMinutes}
              onChangeText={setCustomMinutes}
              keyboardType="decimal-pad"
              placeholder="Minutes"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <ForgeButton title="Set" variant="secondary" onPress={applyCustomDuration} style={styles.setButton} />
          </View>
          <View style={styles.buttonRow}>
            <ForgeButton title={isRunning ? "Pause" : "Start"} onPress={startCountdown} style={styles.actionButton} />
            <ForgeButton title="Reset" variant="secondary" onPress={resetTimer} style={styles.actionButton} />
          </View>
        </ForgeCard>
      )}
    </>
  );
}

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.modeButton, active && styles.modeButtonActive, pressed && styles.pressed]}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  clockCard: { alignItems: "center", gap: 6 },
  panelHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  panelTitle: { color: colors.text, fontSize: 16, fontWeight: "900", letterSpacing: 0 },
  clock: { color: colors.text, fontSize: 46, fontWeight: "900", letterSpacing: 0 },
  date: { color: colors.muted, fontSize: 14, fontWeight: "800", letterSpacing: 0 },
  switch: { flexDirection: "row", gap: 10 },
  modeButton: { flex: 1, minHeight: 48, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  modeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeText: { color: colors.text, fontSize: 14, fontWeight: "900", letterSpacing: 0 },
  modeTextActive: { color: colors.white },
  card: { gap: 16 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900", letterSpacing: 0 },
  timerValue: { color: colors.text, fontSize: 44, fontWeight: "900", textAlign: "center", letterSpacing: 0 },
  buttonRow: { flexDirection: "row", gap: 12 },
  actionButton: { flex: 1 },
  lapList: { gap: 10 },
  listTitle: { color: colors.text, fontSize: 15, fontWeight: "900", letterSpacing: 0 },
  mutedText: { color: colors.muted, fontWeight: "700" },
  lapRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  lapLabel: { color: colors.muted, fontWeight: "800" },
  lapTime: { color: colors.text, fontWeight: "900" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickButton: { minHeight: 42, borderRadius: 16, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  quickButtonActive: { borderColor: colors.primary },
  quickText: { color: colors.text, fontWeight: "800", letterSpacing: 0 },
  quickTextActive: { color: colors.primary },
  customRow: { flexDirection: "row", gap: 10 },
  input: { flex: 1, minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface2, paddingHorizontal: 16, color: colors.text, fontSize: 15, fontWeight: "800" },
  setButton: { minWidth: 92 },
  finished: { color: colors.warning, textAlign: "center", fontSize: 15, fontWeight: "900", letterSpacing: 0 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 }
});
