import { StyleSheet, Text, View } from "react-native";
import { Booking } from "@/types/class";
import { ForgeCard } from "@/components/ui/ForgeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/theme/colors";
import { formatDateTime } from "@/utils/formatDate";

export function TodayClassesPreview({ bookings }: { bookings: Booking[] }) {
  if (!bookings.length) return <EmptyState title="No upcoming bookings" message="Book a class from the Classes tab when you are ready." />;
  return (
    <View style={styles.list}>
      {bookings.slice(0, 3).map((booking) => (
        <ForgeCard key={booking.id} style={styles.card}>
          <Text style={styles.title}>{booking.title}</Text>
          <Text style={styles.meta}>{booking.coach || "Coach TBA"} - {formatDateTime(booking.startAt)}</Text>
        </ForgeCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  card: { gap: 4 },
  title: { color: colors.text, fontSize: 16, fontWeight: "900", letterSpacing: 0 },
  meta: { color: colors.muted, fontWeight: "700" }
});
