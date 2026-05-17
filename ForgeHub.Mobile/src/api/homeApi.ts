import { getMe } from "./authApi";
import { getActiveCheckIn } from "./checkInApi";
import { getBookings } from "./classesApi";
import { getMembership } from "./membershipApi";
import { getNotifications } from "./notificationsApi";
import { getProfile } from "./profileApi";
import { getJson } from "./apiClient";
import { endpoints } from "./endpoints";
import { AuthUser } from "@/types/auth";
import { Booking } from "@/types/class";
import { ActiveCheckIn } from "@/types/checkIn";
import { Membership } from "@/types/membership";
import { NotificationItem } from "@/types/notification";
import { MemberProfile } from "@/types/profile";

export interface DashboardStats {
  weeklyAttendance: number[];
  monthlyAttendance: number[];
  workoutFrequency: number;
  totalCheckIns: number;
  caloriesBurnedEstimate: number;
}

export interface HomeDashboard {
  user: AuthUser | null;
  profile: MemberProfile | null;
  membership: Membership | null;
  stats: DashboardStats;
  bookings: Booking[];
  activeCheckIn: ActiveCheckIn | null;
  notifications: NotificationItem[];
  warnings: string[];
}

export async function getHomeDashboard(): Promise<HomeDashboard> {
  const settled = await Promise.allSettled([
    getMe(),
    getProfile(),
    getMembership(),
    getJson<DashboardStats>(endpoints.home.stats),
    getBookings(),
    getActiveCheckIn(),
    getNotifications()
  ]);

  const warnings = settled
    .map((item, index) => ({ item, label: ["user", "profile", "membership", "stats", "bookings", "active check-in", "notifications"][index] }))
    .filter((entry) => entry.item.status === "rejected")
    .map((entry) => entry.label ?? "endpoint");

  const value = <T>(index: number, fallback: T): T => {
    const item = settled[index];
    return item?.status === "fulfilled" ? (item.value as T) : fallback;
  };

  return {
    user: value<AuthUser | null>(0, null),
    profile: value<MemberProfile | null>(1, null),
    membership: value<Membership | null>(2, null),
    stats: value(3, { weeklyAttendance: [], monthlyAttendance: [], workoutFrequency: 0, totalCheckIns: 0, caloriesBurnedEstimate: 0 }),
    bookings: value<Booking[]>(4, []),
    activeCheckIn: value<ActiveCheckIn | null>(5, null),
    notifications: value<NotificationItem[]>(6, []),
    warnings
  };
}
