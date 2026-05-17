import { useEffect } from "react";
import { router, useSegments } from "expo-router";
import { useAuthStore } from "./authStore";

export function useAuthGuard() {
  const user = useAuthStore((state) => state.user);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const segments = useSegments();

  useEffect(() => {
    if (!bootstrapped) return;
    const firstSegment = segments[0] as string | undefined;
    const inPublic = firstSegment === "login" || firstSegment === undefined;
    if (!user && !inPublic) router.replace("/login");
    if (user && inPublic) router.replace("/tabs/home");
  }, [bootstrapped, segments, user]);
}
