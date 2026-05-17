export interface QrScanResult {
  success: boolean;
  message: string;
  branchId?: number;
  branchName?: string;
  checkInTimeUtc?: string;
  currentOccupancy?: number;
  capacity?: number;
}

export interface ActiveCheckIn {
  hasActiveCheckIn: boolean;
  checkInId?: number;
  branchId?: number;
  branchName?: string;
  branchLatitude?: number | null;
  branchLongitude?: number | null;
  radiusMeters?: number | null;
  checkInTimeUtc?: string;
  durationMinutes?: number;
  status?: string;
}

export interface AutoCheckOutResult {
  checkedOut: boolean;
  distanceMeters?: number | null;
  radiusMeters?: number | null;
  branchId?: number | null;
  branchName?: string | null;
  checkOutTimeUtc?: string | null;
  message?: string;
}

export interface CheckInHistoryItem {
  id: number;
  branchName?: string;
  checkInTime?: string;
  checkOutTime?: string | null;
  method?: string;
}
