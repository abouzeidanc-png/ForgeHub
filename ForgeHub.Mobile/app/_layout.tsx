import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { useAuthGuard } from "@/auth/useAuthGuard";
import { useActiveCheckInLocationWatcher } from "@/features/qr/useActiveCheckInLocationWatcher";
import { colors } from "@/theme/colors";

function RootNavigator() {
  useAuthGuard();
  useActiveCheckInLocationWatcher();
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="qr-scan" />
        <Stack.Screen name="active-checkin" />
        <Stack.Screen name="membership" />
        <Stack.Screen name="branches" />
        <Stack.Screen name="bookings" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="history" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="classes/[id]" />
      </Stack>
    </>
  );
}

export default function Layout() {
  const client = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000
      }
    }
  }), []);
  return (
    <QueryClientProvider client={client}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
